// Quick verification of the legacy allotment import.
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// 1. Total imported rows
const { count: totalImported } = await supabase
  .from('tm_allotments')
  .select('id', { count: 'exact', head: true })
  .like('notes', '%[Imported from legacy schedule_id=%]%');

console.log(`Total imported rows: ${totalImported}`);

// 2. Group by zone
const { data: byZone } = await supabase
  .from('tm_allotments')
  .select('zone_id')
  .like('notes', '%[Imported from legacy schedule_id=%]%');

const zoneCounts = {};
for (const r of byZone ?? []) zoneCounts[r.zone_id] = (zoneCounts[r.zone_id] ?? 0) + 1;
console.log('\nBy zone:');
for (const [z, n] of Object.entries(zoneCounts)) console.log(`  ${z.padEnd(25)} ${n}`);

// 3. Total in tm_allotments (all sources)
const { count: totalAll } = await supabase
  .from('tm_allotments')
  .select('id', { count: 'exact', head: true });
console.log(`\nTotal rows in tm_allotments (all sources): ${totalAll}`);

// 4. Sanity: no booking-table rows mutated
const { count: bookingsWithLegacyRef } = await supabase
  .from('bookings')
  .select('id', { count: 'exact', head: true })
  .like('booking_ref', 'OB%');
console.log(`\nBookings with old OB-prefix refs (should be 0): ${bookingsWithLegacyRef}`);

// 5. Sample
const { data: sample } = await supabase
  .from('tm_allotments')
  .select('zone_id, table_code, start_at, customer_name, booking_ref, notes')
  .like('notes', '%[Imported from legacy schedule_id=%]%')
  .order('start_at', { ascending: true })
  .limit(5);
console.log('\nFirst 5 imported rows (by start_at):');
for (const r of sample ?? []) {
  console.log(`  ${r.start_at} | ${r.zone_id}/${r.table_code} | ${r.customer_name ?? '(no name)'} | ref=${r.booking_ref ?? '-'}`);
}
