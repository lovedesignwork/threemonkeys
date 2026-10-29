import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://localhost:3128';
const origin = new URL(base).origin;
const mappings = new Map([
  ['/home', '/'],
  ['/contact-phuket-three-monkeys-restaurant', '/contact'],
  ['/faq-three-monkeys-restaurant-phuket', '/faq'],
  ['/menu-three-monkeys-phuket-diner-thailand', '/menu'],
]);

for (const [source, destination] of mappings) {
  for (const suffix of ['', '/']) {
    let current = new URL(source + suffix + '?utm_source=legacy&next=https%3A%2F%2Fexample.net%2F', base);
    let redirects = 0;
    for (;;) {
      const response = await fetch(current, { redirect: 'manual' });
      if (response.status === 200) break;
      assert.equal(response.status, 308, current.href);
      assert.ok(++redirects <= 2, 'no redirect loops');
      const location = response.headers.get('location');
      assert.ok(location);
      current = new URL(location, current);
      assert.equal(current.origin, origin, 'query cannot redirect outside the site');
    }
    assert.ok(redirects >= 1);
    assert.equal(current.pathname, destination);
    assert.equal(current.searchParams.get('utm_source'), 'legacy');
    console.log(`PASS permanent exact redirect: ${source + suffix} -> ${destination}`);
  }
}

for (const path of ['/', '/contact', '/faq', '/menu', '/th', '/th/menu', '/cn/menu']) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 200, `valid route unchanged: ${path}`);
}
for (const path of ['/th/home', '/cn/home', '/home/extra', '/category/thai-food', '/a-fun-filled-day-at-three-monkeys', '/packages/rooftop-romantic', '/menu-three-monkeys-phuket-diner-thailand/3m_menu-food_04-05_0']) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 404, `unmapped URL retains 404: ${path}`);
}
console.log('PASS current and localized routes remain valid; deleted/unknown/attachment URLs retain 404');
