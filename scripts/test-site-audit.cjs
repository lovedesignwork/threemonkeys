const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports, extra={}) {
 const m = {exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:n=>{if(n in imports)return imports[n];throw new Error(n)},URL,...extra});
 return m.exports;
}
const seo = load('lib/seo/config.ts',{});
for(const locale of ['en','th','ar']) for(const path of ['/','/menu','/contact']) {
 const m=seo.localizePageMetadata(seo.generatePageMetadata('Title','Description',path),locale);
 const expected=seo.siteConfig.url+(locale==='en'?path:`/${locale}${path==='/'?'':path}`);
 assert.equal(m.alternates.canonical,expected);assert.equal(m.openGraph.url,expected);
 assert.equal(m.alternates.languages.en,seo.siteConfig.url+path);
}
console.log('PASS: 9 page/locale canonical and Open Graph cases');
const env={MAINTENANCE_MODE:'true',MAINTENANCE_BYPASS_PIN:'audit-only-value'};
const calls=[];
const mw=load('middleware.ts',{
 'next/server':{NextResponse:{next:()=>({kind:'next'}),rewrite:()=>({kind:'maintenance'}),redirect:()=>({kind:'redirect',cookies:{set:()=>{}}})}},
 'next-intl/middleware':{default:()=>req=>{calls.push(req.nextUrl.pathname);return {kind:'locale'}}},
 './i18n/routing':{routing:{}}
},{process:{env}});
function request(path,cookies={}){const u=new URL('https://local.test'+path);u.clone=()=>new URL(u);return {nextUrl:u,url:u.href,cookies:{get:name=>cookies[name]?{value:cookies[name]}:undefined}};}
assert.equal(mw.middleware(request('/menu')).kind,'maintenance');
assert.equal(mw.middleware(request('/menu',{tm_preview:env.MAINTENANCE_BYPASS_PIN})).kind,'locale');
assert.equal(mw.middleware(request('/th/menu',{tm_admin:'1'})).kind,'locale');
assert.equal(mw.middleware(request('/admin')).kind,'next');
assert.equal(mw.middleware(request('/api/bookings')).kind,'next');
env.MAINTENANCE_MODE='false';assert.equal(mw.middleware(request('/menu')).kind,'locale');
console.log('PASS: 6 maintenance/locale routing cases');
for(const file of ['public/images/threemonkeyslogo.png','public/images/new/threemonkeys057.jpg','public/images/new/threemonkeys048.jpg','app/opengraph-image.tsx']) assert.ok(fs.existsSync(file),file);
assert.ok(!fs.existsSync('public/robots.txt'));assert.ok(!fs.existsSync('public/sitemap.xml'));
console.log('PASS: schema assets exist; metadata route/static-file conflicts removed');
