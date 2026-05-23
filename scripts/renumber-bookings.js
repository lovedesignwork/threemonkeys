/* eslint-disable */
/**
 * One-shot: convert any legacy booking_ref to the new 3M-NNNNNN format
 * ordered by created_at ASC. Safe to re-run — only touches rows that
 * don't already match the new format.
 *
 *   node scripts/renumber-bookings.js
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

(async () => {
  // Fetch all bookings ordered by created_at
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, booking_ref, created_at')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }

  // Find the highest existing 3M-NNNNNN
  let nextNum = 0;
  for (const b of bookings) {
    const m = b.booking_ref?.match(/^3M-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > nextNum) nextNum = n;
    }
  }

  const toUpdate = bookings.filter((b) => !/^3M-\d+$/.test(b.booking_ref || ''));
  if (toUpdate.length === 0) {
    console.log('All bookings already use 3M-NNNNNN format. Nothing to do.');
    return;
  }

  console.log(`Renumbering ${toUpdate.length} booking(s) starting at 3M-${String(nextNum + 1).padStart(6, '0')}\n`);

  for (const b of toUpdate) {
    nextNum += 1;
    const newRef = `3M-${String(nextNum).padStart(6, '0')}`;
    const { error: updErr } = await supabase
      .from('bookings')
      .update({ booking_ref: newRef })
      .eq('id', b.id);
    if (updErr) {
      console.error(`  ✗ ${b.booking_ref} -> ${newRef} (${updErr.message})`);
    } else {
      console.log(`  ✓ ${b.booking_ref} -> ${newRef}`);
    }
  }
})();
