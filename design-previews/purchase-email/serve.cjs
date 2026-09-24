// Local, read-only approval preview. No email provider or application API is loaded.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { render } = require('@react-email/render');
const port = Number(process.argv[2] || 3055);
const root = __dirname;

function template() {
  const loaded = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, 'PurchaseThankYou.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(compiled, { module: loaded, exports: loaded.exports, require, console, Intl, Date });
  return loaded.exports.default;
}

async function email(scenario = 'standard', assetBaseUrl = '/assets') {
  const props = {
    customerName: 'Alex', bookingRef: '3M-260918-024', packageName: 'Monkey Dome',
    activityDate: 'Friday, 18 September 2026', timeSlot: '19:00', guestCount: 2,
    totalAmount: 4000, hasTransfer: false, zoneName: 'Monkey Dome', assetBaseUrl,
  };
  if (scenario === 'extras') Object.assign(props, {
    totalAmount: 7700, hasTransfer: true, isPrivateTransfer: true,
    hotelName: 'Sample hotel, Patong', roomNumber: '208',
    addons: [{ name: 'Birthday Mini', quantity: 1, price: 1200 }],
    specialRequests: 'We are celebrating a birthday. A vegetarian menu would be lovely.',
  });
  return render(React.createElement(template(), props));
}

const assetNames = new Set(['logo.png', 'botanical-canopy.jpg', 'rainforest-dining.jpg']);
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const url = new URL(req.url, `http://localhost:${port}`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (url.pathname.startsWith('/assets/')) {
      const name = url.pathname.slice('/assets/'.length);
      if (!assetNames.has(name)) { res.writeHead(404); return res.end(); }
      res.setHeader('Content-Type', name.endsWith('.png') ? 'image/png' : 'image/jpeg');
      return res.end(fs.readFileSync(path.join(root, 'assets', name)));
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (url.pathname === '/email') return res.end(await email(url.searchParams.get('scenario')));
    if (url.pathname === '/') return res.end(fs.readFileSync(path.join(root, 'preview.html')));
    res.writeHead(404); res.end('Not found');
  } catch (error) { console.error(error); res.writeHead(500); res.end('Unable to render the email preview.'); }
});

if (require.main === module) server.listen(port, '127.0.0.1', () => console.log(`Purchase email draft: http://localhost:${port}`));
module.exports = { email };
