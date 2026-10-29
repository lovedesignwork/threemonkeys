import fs from 'node:fs/promises';
import { load } from 'cheerio';

const origin = 'https://threemonkeysphuket.com';
const headers = { 'User-Agent': 'ThreeMonkeys-SEO-Audit/1.0' };
const request = (url, extra = {}) => fetch(url, { headers: { ...headers, ...extra }, signal: AbortSignal.timeout(25000) });
const robotsResponse = await request(`${origin}/robots.txt`);
const robots = await robotsResponse.text();
const blocked = robots.split(/\r?\n/).map(line => line.match(/^Disallow:\s*(\S+)/i)?.[1]).filter(Boolean);
const sitemapResponse = await request(`${origin}/sitemap.xml`);
const xml = load(await sitemapResponse.text(), { xml: true });
const urls = [...new Set(xml('url > loc').map((_, el) => xml(el).text()).get())]
  .filter(url => url.startsWith(origin) && !blocked.some(path => new URL(url).pathname.startsWith(path)))
  .slice(0, 500);
const pages = [];
let cursor = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const start = Date.now();
    try {
      const response = await request(url);
      const $ = load(await response.text());
      const canonical = $('link[rel="canonical"]').attr('href') || null;
      const noindex = /noindex/i.test($('meta[name="robots"]').attr('content') || response.headers.get('x-robots-tag') || '');
      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content');
      const h1Count = $('h1').length;
      pages.push({ url, status: response.status, finalUrl: response.url, ms: Date.now() - start,
        title, description, canonical, noindex, h1Count, htmlLang: $('html').attr('lang'),
        issues: [response.status !== 200 && `HTTP ${response.status}`, noindex && 'noindex in sitemap',
          !title && 'missing title', !description && 'missing description',
          !canonical && 'missing canonical', canonical && canonical.replace(/\/$/, '') !== url.replace(/\/$/, '') && 'non-self canonical',
          h1Count !== 1 && `H1 count ${h1Count}`].filter(Boolean),
      });
    } catch (error) { pages.push({ url, issues: [String(error)] }); }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}));
const crawlers = [];
for (const userAgent of ['Mozilla/5.0', 'Googlebot', 'OAI-SearchBot']) {
  const response = await request(`${origin}/`, { 'User-Agent': userAgent });
  const $ = load(await response.text());
  crawlers.push({ userAgent, status: response.status, h1: $('h1').text(), title: $('title').text() });
}
const report = { checkedAt: new Date().toISOString(), origin, robotsStatus: robotsResponse.status,
  sitemapStatus: sitemapResponse.status, count: pages.length, issueCount: pages.filter(page => page.issues.length).length,
  crawlers, pages: pages.sort((a, b) => a.url.localeCompare(b.url)),
};
await fs.mkdir('docs/verification', { recursive: true });
await fs.writeFile('docs/verification/public-seo-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ count: report.count, issueCount: report.issueCount, crawlers, issues: pages.filter(page => page.issues.length) }, null, 2));
