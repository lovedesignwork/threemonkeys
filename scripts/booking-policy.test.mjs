import fs from 'node:fs';
import assert from 'node:assert/strict';
for (const locale of ['en','th','cn','ja','ko','ru','fr','es','ar']) {
  const data=JSON.parse(fs.readFileSync(`messages/${locale}.json`,'utf8'));
  const values=[data.faqPage.questions.booking.a2,data.faqPage.questions.packages.a1];
  assert.ok(values.every(value=>value && !/24|２４|٢٤/.test(value)),locale);
}
for (const file of ['app/[locale]/(public)/terms/page.tsx','app/[locale]/(public)/refund/page.tsx','components/checkout/CardPaymentForm.tsx','components/checkout/EmbeddedCardForm.tsx','lib/data/faq.ts']) {
  const source=fs.readFileSync(file,'utf8');
  assert.ok(!/fully refundable|5%|non-refundable within 24|24 hours.*(?:no charge|refund)/i.test(source),file);
  assert.ok(/non-refundable/i.test(source),file);
  assert.ok(/reschedul/i.test(source),file);
}
for (const file of ['app/[locale]/(public)/terms/page.tsx','app/[locale]/(public)/refund/page.tsx']) {
  const source=fs.readFileSync(file,'utf8');
  assert.ok(source.includes('at least 1 day in advance'),file);
  assert.ok(source.includes('If Three Monkeys cancels your reservation'),file);
  assert.ok(source.includes('full refund with no processing fee deducted'),file);
}
console.log('PASS confirmed non-refundable/rescheduling policy across 9 locales, legal pages, FAQ data and payment forms');
