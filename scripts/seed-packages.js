/* eslint-disable */
/**
 * Sync packages from lib/data/packages.ts into the Supabase `packages`
 * table so that the booking FK constraint (bookings.package_id) and the
 * booking_sync_to_onebooking trigger have valid rows to reference.
 *
 * Safe to re-run: upserts on `id`.
 *
 *   node scripts/seed-packages.js
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual .env.local loader
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
for (const line of envFile.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Read packages.ts and pull out the array via a `require` trick.
// We compile the TS file on the fly using esbuild if available, else fall
// back to a regex-based parser. Easiest path: read JSON-ish data from the
// source file directly.

// Inline package list — keep in sync with lib/data/packages.ts. We only
// need the columns the `packages` table accepts.
const packages = [
  // Seats — Premium
  { id: 'monkey-dome', name: 'MONKEY DOME', description: 'Our most photogenic dining zone, perfect for romantic dinners and special occasions.', price: 4000, duration: '1-2 hours', category: 'combined', image_url: '/images/by_slide/slide_05/monkey-dome01.jpg' },
  { id: 'monkey-nest', name: 'MONKEY NEST', description: 'Our signature must-see corner featuring unique elevated seating surrounded by nature.', price: 4000, duration: '1-2 hours', category: 'combined', image_url: '/images/by_slide/slide_10/monkeynest1.jpg' },
  // Seats — Standard / Zones
  { id: 'bamboo-pavilion', name: 'Bamboo Pavilion Exclusive Seat', description: 'Brand new exclusive bamboo pavilion seating.', price: 500, duration: '1-2 hours', category: 'combined', image_url: '/images/by_slide/slide_15/bamboopav2.jpg' },
  { id: 'zone-6', name: 'ZONE 6 (T)', description: 'Perfect meeting zone for medium-sized groups. Ideal for gatherings, celebrations, and business dinners.', price: 500, duration: 'up to 4 hours', category: 'combined', image_url: '/images/by_slide/slide_30/zone6_1.jpg' },
  { id: 'zone-7', name: 'ZONE 7 (Z)', description: 'Our largest meeting zone, perfect for large groups, events, and celebrations up to 50 persons.', price: 500, duration: 'up to 4 hours', category: 'combined', image_url: '/images/by_slide/slide_25/zone7_4_resize.jpg' },
  { id: 'monkey-hilltop', name: 'Monkey Hill Top', description: 'Elevated hilltop dining with panoramic views of the surrounding rainforest.', price: 500, duration: '1-2 hours', category: 'combined', image_url: '/images/by_slide/slide_40/monkeyhilltop1.jpg' },
  { id: 'rooftop-romantic', name: 'Rooftop Romantic Dinner', description: 'Romantic dining on our rooftop with stunning views.', price: 500, duration: 'up to 4 hours', category: 'romantic', image_url: '/images/by_slide/slide_35/romantictop1.jpg' },
  { id: 'exclusive-romantic-zone-7', name: 'EXCLUSIVE ROMANTIC AREA ZONE 7', description: 'Exclusive romantic area within Zone 7.', price: 500, duration: 'up to 4 hours', category: 'romantic', image_url: '/images/by_slide/slide_20/zone7romantic1.jpg' },
  // Open Seating
  { id: 'indoor-seat', name: 'Indoor Seat', description: 'Climate-controlled indoor seating with an inviting ambience.', price: 500, duration: 'up to 4 hours', category: 'combined', image_url: '/images/by_slide/slide_45/indoor1.jpg' },
  { id: 'outdoor-seat', name: 'Outdoor Seat', description: 'Open-air outdoor seating surrounded by nature.', price: 500, duration: 'up to 4 hours', category: 'combined', image_url: '/images/by_slide/slide_50/outdoor1.jpg' },
  // Special Packages
  { id: 'ultimate-dinner', name: 'Ultimate Dinner Package', description: 'An unforgettable romantic dining experience at Three Monkeys Restaurant.', price: 15000, duration: '3 hours', category: 'romantic', image_url: '/images/small/small-sized_15.jpg' },
  { id: 'ultimate-birthday', name: 'Ultimate Birthday Package', description: 'Celebrate your birthday in style at Three Monkeys Restaurant.', price: 15000, duration: '3 hours', category: 'celebration', image_url: '/images/small/small-sized_16.jpg' },
  { id: 'ultimate-romantic-dinner', name: 'Ultimate Romantic Dinner', description: 'A premium romantic dinner experience.', price: 25000, duration: '3 hours', category: 'romantic', image_url: '/images/by_slide/slide_40/monkeyhilltop2_resize.jpg' },
  { id: 'will-you-marry-me', name: 'Will You Marry Me Package', description: 'The ultimate proposal experience.', price: 35000, duration: '3 hours', category: 'romantic', image_url: '/images/small/small-sized_18.jpg' },
  { id: 'transfer-vvip-denza', name: 'VVIP Transfer (Denza)', description: 'Premium VVIP transfer service in a Denza luxury vehicle.', price: 2500, duration: 'Round trip', category: 'transfer', image_url: '/images/small/small-sized_19.jpg' },
];

(async () => {
  console.log(`Seeding ${packages.length} packages...\n`);

  const rows = packages.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    duration: p.duration,
    category: p.category,
    image_url: p.image_url,
    is_active: true,
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('packages')
    .upsert(rows, { onConflict: 'id' })
    .select('id, name, price');

  if (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }

  console.log(`Upserted ${data?.length || 0} packages:`);
  for (const row of data || []) {
    console.log(`  ✓ ${row.id} — ${row.name} (฿${row.price})`);
  }
})();
