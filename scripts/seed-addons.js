/* eslint-disable */
/**
 * Sync the promotional add-on catalog from lib/data/addons.ts into the
 * Supabase `promo_addons` table. The `booking_addons.addon_id` column has
 * a FK -> promo_addons.id, so this MUST stay populated otherwise the
 * checkout API will silently fail to record add-ons against bookings.
 *
 *   node scripts/seed-addons.js
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
for (const line of envFile.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Mirror of PROMOTIONAL_ADDONS in lib/data/addons.ts. Keep these in sync.
const addons = [
  {
    id: 'violin-dinner',
    name: 'Private Dinner With Violin 1 Hour',
    description:
      'Enjoy an exclusive experience with live 1 hour Violin performance — all at your own private table.',
    price: 6000,
  },
  {
    id: 'saxophone-dinner',
    name: 'Private Dinner With Saxophone',
    description: 'Live saxophone performance during your private dinner.',
    price: 6000,
  },
  {
    id: 'spark-fountain',
    name: 'Spark Fountain & Smoke Machine',
    description: 'Cinematic spark fountain and smoke effect for your celebration moment.',
    price: 2500,
  },
  {
    id: 'honeymoon-anniversary',
    name: 'Honeymoon Anniversary',
    description: 'A romantic honeymoon / anniversary setup with thoughtful touches.',
    price: 1999,
  },
  {
    id: 'birthday-mini',
    name: 'Birthday Mini',
    description:
      'Brownies Cake 1 Piece | 1 Set of Balloons Pole. Make your birthday extra special at Three Monkeys.',
    price: 1200,
  },
  {
    id: 'private-transfer',
    name: 'Private Round-Trip Transfer',
    description: 'Private round-trip transfer to and from Three Monkeys.',
    price: 2000,
  },
];

(async () => {
  const rows = addons.map((a) => ({
    ...a,
    is_active: true,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('promo_addons')
    .upsert(rows, { onConflict: 'id' })
    .select('id, name, price');

  if (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }

  console.log(`Upserted ${data?.length || 0} promo_addons:`);
  for (const r of data || []) {
    console.log(`  ✓ ${r.id} — ${r.name} (฿${r.price})`);
  }
})();
