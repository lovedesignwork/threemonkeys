// ---------------------------------------------------------------------
// Import old allotment data from the legacy MySQL dump into tm_allotments.
// ---------------------------------------------------------------------
//
// Usage:
//   node scripts/import-old-allotments.mjs --dry-run
//   node scripts/import-old-allotments.mjs --execute
//
// What it does:
//   1. Parses the legacy SQL dump at "3M SQL/xymgvkmmzy.sql"
//   2. Extracts skyw_restaurant_zone_table_schedule rows
//   3. Filters to rows whose start datetime (Asia/Bangkok) >= 2026-05-24 00:00
//   4. Maps old zone_id + table_name -> our tm_zones.id + tm_tables.table_code
//   5. Inserts into public.tm_allotments with source='other' (no bookings touched)
//
// Notes:
//   * Only writes to public.tm_allotments — NEVER touches public.bookings.
//   * OMBRE-prefixed tables are ignored entirely (not Three Monkeys data).
//   * Unmappable zones (e.g. legacy "M", "K", "VIP", "TL", "TC", "TR")
//     are reported but skipped.
// ---------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually (no dotenv dep)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

const args = new Set(process.argv.slice(2));
const DRY_RUN = !args.has('--execute');
const SQL_PATH = path.resolve(process.cwd(), '3M SQL', 'xymgvkmmzy.sql');
const CUTOFF_BKK = '2026-05-24 00:00:00'; // Asia/Bangkok naïve

// ---------------------------------------------------------------------
// 1. Mapping table: old zone_id -> { new_zone_id, tableRemap }
// ---------------------------------------------------------------------
// tableRemap is a function (old table_name) -> new table_code | null
const ZONE_MAP = {
  // Old zone 1 = MD -> Monkey Dome (MD1, MD2, MD3)
  1: {
    newZoneId: 'monkey-dome',
    remap: (name) => {
      const m = name.match(/^MD\s*(\d+)/i);
      return m ? `MD${m[1]}` : null;
    },
  },
  // Old zone 2 = MN -> Monkey Nest (MN1, MN2)
  2: {
    newZoneId: 'monkey-nest',
    remap: (name) => {
      const m = name.match(/^MN\s*(\d+)/i);
      return m ? `MN${m[1]}` : null;
    },
  },
  // Old zone 6 = T -> zone-t (T1..T17, no T13)
  6: {
    newZoneId: 'zone-t',
    remap: (name) => {
      const m = name.match(/^T\s*(\d+)/i);
      if (!m) return null;
      const n = parseInt(m[1], 10);
      if (n === 13) return null; // T13 doesn't exist in new system
      if (n < 1 || n > 17) return null;
      return `T${n}`;
    },
  },
  // Old zone 7 = Z -> zone-z or exclusive-romantic (Z26..Z29)
  7: {
    newZoneId: 'zone-z',
    remap: (name) => {
      const m = name.match(/^Z\s*(\d+)/i);
      if (!m) return null;
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= 25) return `Z${n}`;
      if (n >= 31 && n <= 36) return `Z${n}`;
      return null;
    },
    // If Z26-Z29: re-route to exclusive-romantic
    overrideZone: (name) => {
      const m = name.match(/^Z\s*(\d+)/i);
      if (!m) return null;
      const n = parseInt(m[1], 10);
      if (n >= 26 && n <= 29) {
        return { newZoneId: 'exclusive-romantic', newTableCode: `Z${n}` };
      }
      return null;
    },
  },
  // Old zone 9 = B -> Bamboo Pavilion (BP1..BP4)
  9: {
    newZoneId: 'bamboo-pavilion',
    remap: (name) => {
      const m = name.match(/^B\s*(\d+)/i);
      if (!m) return null;
      const n = parseInt(m[1], 10);
      if (n < 1 || n > 4) return null;
      return `BP${n}`;
    },
  },
  // Old zone 15 = HILL TOP -> Monkey Hilltop (Hilltop1)
  15: {
    newZoneId: 'monkey-hilltop',
    remap: (_name) => 'Hilltop1', // single table in new system
  },
  // Old zone 16 = Bamboo Pavilion (single table) -> bamboo-pavilion BP1
  16: {
    newZoneId: 'bamboo-pavilion',
    remap: (_name) => 'BP1',
  },
};

// Zones we deliberately skip (logged but not imported)
const SKIP_ZONES = new Set([
  3,  // M  - not in new system
  4,  // K  - not in new system
  5,  // H  - not in new system
  8,  // VIP - not in new system
  10, // TL - not in new system
  11, // TC - not in new system
  12, // TR - not in new system
  13, // TABLE RESERVATION (different property)
  14, // TABLE RESERVATION (inactive)
]);

// ---------------------------------------------------------------------
// 2. Tuple parser for SQL VALUES (..)
// ---------------------------------------------------------------------
// Handles: numbers, NULL, 'strings with \' escapes' or doubled quotes
function parseTuple(str) {
  const out = [];
  let i = 0;
  const n = str.length;
  while (i < n) {
    // skip whitespace
    while (i < n && /[\s\t]/.test(str[i])) i++;
    if (i >= n) break;
    const c = str[i];
    if (c === "'") {
      // string literal
      let end = i + 1;
      let buf = '';
      while (end < n) {
        if (str[end] === '\\' && end + 1 < n) {
          // backslash escape (MySQL style: \\ \' \" \n \t etc.)
          const next = str[end + 1];
          const map = { n: '\n', t: '\t', r: '\r', "'": "'", '"': '"', '\\': '\\', '0': '\0' };
          buf += map[next] ?? next;
          end += 2;
        } else if (str[end] === "'" && str[end + 1] === "'") {
          // doubled '' -> '
          buf += "'";
          end += 2;
        } else if (str[end] === "'") {
          end++;
          break;
        } else {
          buf += str[end];
          end++;
        }
      }
      out.push(buf);
      i = end;
    } else if (/[\d\-\.]/.test(c)) {
      // number
      let end = i;
      while (end < n && /[\d\-\.eE+]/.test(str[end])) end++;
      out.push(parseFloat(str.substring(i, end)));
      i = end;
    } else if (str.substring(i, i + 4).toUpperCase() === 'NULL') {
      out.push(null);
      i += 4;
    } else {
      // unknown char (e.g. comma) - advance
      i++;
    }
    // skip trailing comma
    while (i < n && /[,\s]/.test(str[i])) i++;
  }
  return out;
}

// Split a VALUES line into individual (...) tuples.
function splitTuples(text) {
  const tuples = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (c === '\\') {
        escape = true;
      } else if (c === "'") {
        if (text[i + 1] === "'") {
          i++; // doubled quote
        } else {
          inString = false;
        }
      }
      continue;
    }
    if (c === "'") {
      inString = true;
      continue;
    }
    if (c === '(') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (c === ')') {
      depth--;
      if (depth === 0 && start >= 0) {
        tuples.push(text.substring(start, i));
        start = -1;
      }
    }
  }
  return tuples;
}

// ---------------------------------------------------------------------
// 3. Extract a labeled INSERT block from the SQL text.
// Each block: "INSERT INTO `tbl` (cols) VALUES\n(..),\n(..),\n(..);\n"
// We accumulate across multiple INSERT INTO blocks for the same table.
// ---------------------------------------------------------------------
function extractInsertBlocks(text, tableName) {
  const re = new RegExp(`INSERT INTO \`${tableName}\` \\([^)]+\\) VALUES`, 'g');
  const blocks = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const startBody = re.lastIndex;
    // find the terminating ';' at start-of-line — easiest: scan forward for ';\n' or ';\r\n'
    let endBody = text.indexOf(';\n', startBody);
    if (endBody < 0) endBody = text.indexOf(';\r\n', startBody);
    if (endBody < 0) endBody = text.length;
    blocks.push(text.substring(startBody, endBody));
  }
  return blocks;
}

// ---------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------
async function main() {
  console.log(`Reading ${SQL_PATH} ...`);
  if (!fs.existsSync(SQL_PATH)) {
    console.error(`File not found: ${SQL_PATH}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(SQL_PATH, 'utf8');
  console.log(`Loaded ${(raw.length / 1024 / 1024).toFixed(1)} MB`);

  // --- Build table -> zone lookup ---
  const tableBlocks = extractInsertBlocks(raw, 'skyw_restaurant_zone_table');
  const oldTables = new Map(); // table_id -> { zone_id, name, property_id }
  for (const block of tableBlocks) {
    for (const tup of splitTuples(block)) {
      const [tid, zid, prop, name] = parseTuple(tup);
      oldTables.set(Number(tid), {
        zone_id: Number(zid),
        property_id: Number(prop),
        name: String(name),
      });
    }
  }
  console.log(`Loaded ${oldTables.size} old tables`);

  // --- Build zone lookup ---
  const zoneBlocks = extractInsertBlocks(raw, 'skyw_restaurant_zone');
  const oldZones = new Map(); // zone_id -> { nickname, property_id }
  for (const block of zoneBlocks) {
    for (const tup of splitTuples(block)) {
      const [zid, prop, , nick] = parseTuple(tup);
      oldZones.set(Number(zid), {
        nickname: String(nick),
        property_id: Number(prop),
      });
    }
  }
  console.log(`Loaded ${oldZones.size} old zones`);

  // --- Extract schedule rows ---
  const scheduleBlocks = extractInsertBlocks(raw, 'skyw_restaurant_zone_table_schedule');
  let totalParsed = 0;
  let afterCutoff = 0;
  const stats = {
    mapped: 0,
    skippedKnown: 0, // SKIP_ZONES
    skippedUnknownZone: 0,
    skippedTableUnmapped: 0,
    skippedPropertyMismatch: 0,
    skippedBeforeCutoff: 0,
  };
  const perZoneCounts = new Map(); // old zone_id -> count
  const perZoneMapped = new Map(); // old zone_id -> mapped count
  const allotments = []; // ready for insert

  for (const block of scheduleBlocks) {
    for (const tup of splitTuples(block)) {
      totalParsed++;
      const cols = parseTuple(tup);
      // schema: schedule_id, table_id, zone_id, property_id, booking_id, guest_type,
      //         guest_name, deposit_amount, schedule_datetime, schedule_datetime_end,
      //         guest, note, email, mobile, schedule_updated, schedule_entered
      const [
        scheduleId, tableId, zoneId, propId, bookingId, guestType, guestName,
        depositAmt, startNaive, endNaive, guests, note, email, mobile,
      ] = cols;

      const startStr = String(startNaive); // 'YYYY-MM-DD HH:MM:SS' Bangkok
      // Filter: cutoff
      if (!startStr || startStr.startsWith('0000') || startStr < CUTOFF_BKK) {
        stats.skippedBeforeCutoff++;
        continue;
      }
      afterCutoff++;

      const oldZid = Number(zoneId);
      perZoneCounts.set(oldZid, (perZoneCounts.get(oldZid) ?? 0) + 1);

      // Filter: skip ombre / known-skip zones
      if (SKIP_ZONES.has(oldZid)) {
        stats.skippedKnown++;
        continue;
      }

      const mapping = ZONE_MAP[oldZid];
      if (!mapping) {
        stats.skippedUnknownZone++;
        continue;
      }

      const tblInfo = oldTables.get(Number(tableId));
      if (!tblInfo) {
        stats.skippedTableUnmapped++;
        continue;
      }

      // Map table
      let newZoneId = mapping.newZoneId;
      let newTableCode = null;
      if (mapping.overrideZone) {
        const ov = mapping.overrideZone(tblInfo.name);
        if (ov) {
          newZoneId = ov.newZoneId;
          newTableCode = ov.newTableCode;
        }
      }
      if (!newTableCode) {
        newTableCode = mapping.remap(tblInfo.name);
      }
      if (!newTableCode) {
        stats.skippedTableUnmapped++;
        continue;
      }

      // Convert Bangkok naïve datetime -> ISO with +07:00 offset
      const startIso = startStr.replace(' ', 'T') + '+07:00';
      // end: prefer original if valid, else start + 180 min
      let endIso;
      if (endNaive && !String(endNaive).startsWith('0000') && String(endNaive) > startStr) {
        endIso = String(endNaive).replace(' ', 'T') + '+07:00';
      } else {
        const startDate = new Date(startIso);
        endIso = new Date(startDate.getTime() + 180 * 60 * 1000).toISOString();
      }

      const customerName = (guestName && String(guestName).trim()) || null;
      const guestCount = Number(guests) || null;
      const noteParts = [];
      if (bookingId && String(bookingId).trim()) noteParts.push(`Old ref: ${bookingId}`);
      if (guestType && String(guestType).trim()) noteParts.push(`Type: ${guestType}`);
      if (note && String(note).trim()) noteParts.push(String(note).trim());
      if (depositAmt && String(depositAmt).trim() && String(depositAmt).trim() !== '0') {
        noteParts.push(`Deposit: ${depositAmt}`);
      }
      if (email && String(email).trim()) noteParts.push(`Email: ${email}`);
      if (mobile && String(mobile).trim()) noteParts.push(`Mobile: ${mobile}`);
      noteParts.push(`[Imported from legacy schedule_id=${scheduleId}]`);

      // Parse deposit amount as numeric (cleans " 3000 " etc)
      let depositNum = null;
      if (depositAmt) {
        const cleaned = String(depositAmt).replace(/[^\d.]/g, '');
        if (cleaned) depositNum = Number(cleaned);
      }

      allotments.push({
        zone_id: newZoneId,
        table_code: newTableCode,
        start_at: startIso,
        end_at: endIso,
        source: 'other',
        booking_id: null,
        booking_ref: bookingId && String(bookingId).trim() ? String(bookingId).trim() : null,
        customer_name: customerName,
        guest_count: guestCount,
        deposit_amount: depositNum,
        notes: noteParts.join(' | '),
        // legacy_schedule_id stored in notes too
      });
      stats.mapped++;
      perZoneMapped.set(oldZid, (perZoneMapped.get(oldZid) ?? 0) + 1);
    }
  }

  console.log('');
  console.log('=== PARSE SUMMARY ===');
  console.log(`Total schedule rows parsed: ${totalParsed}`);
  console.log(`Rows with start >= ${CUTOFF_BKK} (Bangkok): ${afterCutoff}`);
  console.log(`  -> Mapped (ready for insert): ${stats.mapped}`);
  console.log(`  -> Skipped (known unmappable zones): ${stats.skippedKnown}`);
  console.log(`  -> Skipped (zone not in map): ${stats.skippedUnknownZone}`);
  console.log(`  -> Skipped (table not mappable): ${stats.skippedTableUnmapped}`);
  console.log(`  -> Skipped (property mismatch): ${stats.skippedPropertyMismatch}`);
  console.log(`Rows before cutoff (ignored): ${stats.skippedBeforeCutoff}`);

  console.log('');
  console.log('=== PER OLD ZONE (rows after cutoff) ===');
  const sortedZones = [...perZoneCounts.keys()].sort((a, b) => a - b);
  for (const zid of sortedZones) {
    const zinfo = oldZones.get(zid);
    const total = perZoneCounts.get(zid) ?? 0;
    const mapped = perZoneMapped.get(zid) ?? 0;
    const label = zinfo ? `${zinfo.nickname} (prop=${zinfo.property_id})` : '(unknown)';
    const destinationZone = ZONE_MAP[zid]?.newZoneId ?? (SKIP_ZONES.has(zid) ? '— SKIP —' : '— UNMAPPED —');
    const status = mapped === total ? 'OK' : mapped > 0 ? 'PARTIAL' : 'SKIP';
    console.log(`  Zone ${String(zid).padStart(2)} ${label.padEnd(40)} -> ${destinationZone.padEnd(24)} mapped=${mapped}/${total} ${status}`);
  }

  // --- Insert ---
  if (DRY_RUN) {
    console.log('');
    console.log('DRY RUN — nothing inserted. Re-run with --execute to insert.');
    // sample
    if (allotments.length > 0) {
      console.log('Sample row:');
      console.log(JSON.stringify(allotments[0], null, 2));
    }
    return;
  }

  console.log('');
  console.log(`Inserting ${allotments.length} allotments into tm_allotments ...`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Insert in batches of 500
  const BATCH = 500;
  let inserted = 0;
  let failures = 0;
  for (let i = 0; i < allotments.length; i += BATCH) {
    const slice = allotments.slice(i, i + BATCH);
    const { error } = await supabase.from('tm_allotments').insert(slice);
    if (error) {
      failures += slice.length;
      console.error(`Batch ${i / BATCH + 1} FAILED:`, error.message);
    } else {
      inserted += slice.length;
      process.stdout.write(`  ${inserted}/${allotments.length}\r`);
    }
  }
  console.log('');
  console.log(`Inserted: ${inserted}`);
  console.log(`Failed:   ${failures}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
