'use client';

/**
 * /admin/allotment — Table timeline view
 *
 *   Rows    = each individual table (grouped by zone)
 *   Columns = each hour 10:00–22:00 (Bangkok time)
 *   Cells   = either a "+" (free, valid slot), a colored block (booked, spans
 *             multiple cells based on zone.block_minutes), or "—" (not a valid
 *             slot for this zone, e.g. Monkey Dome at 12:00).
 *
 *   Click "+" → open create modal pre-filled with that exact table + time
 *   Click block → open manage modal (edit / move / delete)
 *
 * See docs/ALLOTMENT_SPEC.md
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Footprints,
  Globe,
  HelpCircle,
  Layers,
  Loader2,
  Mail,
  Move,
  Pencil,
  Phone,
  Plus,
  StickyNote,
  Trash2,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { adminGet, adminPost, adminFetch, adminDelete } from '@/lib/auth/api-client';
import { useAuth } from '@/contexts/AuthContext';
import type { AllotmentSource, TmAllotment } from '@/lib/allotment/types';

interface ZoneWithTables {
  id: string;
  name: string;
  time_slots: string[];
  block_minutes: number;
  display_order: number;
  tables: string[];
}

const SOURCES: { value: AllotmentSource; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'phone',   label: 'Phone',   icon: Phone },
  { value: 'email',   label: 'Email',   icon: Mail },
  { value: 'walk_in', label: 'Walk-in', icon: Footprints },
  { value: 'admin',   label: 'Admin',   icon: Wrench },
  { value: 'other',   label: 'Other',   icon: HelpCircle },
];

const SOURCE_STYLE: Record<AllotmentSource, { bg: string; border: string; text: string; pill: string }> = {
  website: { bg: 'bg-blue-100',    border: 'border-l-blue-500',    text: 'text-blue-900',    pill: 'bg-blue-200 text-blue-900' },
  phone:   { bg: 'bg-emerald-100', border: 'border-l-emerald-500', text: 'text-emerald-900', pill: 'bg-emerald-200 text-emerald-900' },
  email:   { bg: 'bg-purple-100',  border: 'border-l-purple-500',  text: 'text-purple-900',  pill: 'bg-purple-200 text-purple-900' },
  walk_in: { bg: 'bg-amber-100',   border: 'border-l-amber-500',   text: 'text-amber-900',   pill: 'bg-amber-200 text-amber-900' },
  admin:   { bg: 'bg-slate-200',   border: 'border-l-slate-500',   text: 'text-slate-900',   pill: 'bg-slate-300 text-slate-900' },
  other:   { bg: 'bg-pink-100',    border: 'border-l-pink-500',    text: 'text-pink-900',    pill: 'bg-pink-200 text-pink-900' },
};

const HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

function pad2(n: number): string { return String(n).padStart(2, '0'); }
function hourLabel(h: number): string { return `${pad2(h)}:00`; }

function todayIsoBangkok(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

function shiftDay(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00+07:00');
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00+07:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Bangkok' });
}

function formatTimeBKK(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
}

function bkkDateISO(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso));
}

/** Bangkok-local HOUR (0–23) of an ISO timestamp. */
function bkkHourOf(iso: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', hour: '2-digit', hour12: false,
  }).format(new Date(iso));
  return parseInt(parts, 10);
}

// ────────────────────────────────────────────────────────────────────────────

type ModalMode =
  | { kind: 'closed' }
  | { kind: 'create'; zoneId?: string; date?: string; time?: string; tableCode?: string }
  | { kind: 'manage'; allotment: TmAllotment }
  | { kind: 'zone-block'; date: string }
  | { kind: 'bulk-cancel'; date: string };

function formatDateDisplay(iso: string): string {
  const d = new Date(iso + 'T00:00:00+07:00');
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Bangkok',
  });
}

export default function AllotmentPage() {
  const { loading: authLoading } = useAuth();
  const [day, setDay] = useState<string>(todayIsoBangkok());
  const [zones, setZones] = useState<ZoneWithTables[]>([]);
  const [allotments, setAllotments] = useState<TmAllotment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>({ kind: 'closed' });
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  // ── Data fetch ────────────────────────────────────────────────────────
  const fetchDay = useCallback(async (selectedDay: string) => {
    setLoading(true);
    setError(null);
    try {
      // We need allotments that overlap the selected Bangkok day. A 3h block
      // starting at 22:00 could span past midnight, so fetch through next-day
      // 02:00 BKK to be safe.
      const from = new Date(`${selectedDay}T00:00:00+07:00`).toISOString();
      const nextDay = shiftDay(selectedDay, 1);
      const to = new Date(`${nextDay}T02:00:00+07:00`).toISOString();
      const params = new URLSearchParams({ from, to });
      const res = await adminGet(`/api/admin/allotment?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load');
      setZones(json.zones ?? []);
      setAllotments(json.allotments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchDay(day);
  }, [authLoading, day, fetchDay]);

  const refresh = useCallback(() => fetchDay(day), [day, fetchDay]);

  // ── Quick zone-level summary (compact pills) ─────────────────────────
  const zoneStats = useMemo(() => {
    return zones.map(z => {
      const tablesBooked = new Set<string>();
      for (const a of allotments) {
        if (a.zone_id !== z.id) continue;
        tablesBooked.add(a.table_code);
      }
      return { zoneId: z.id, name: z.name, booked: tablesBooked.size, total: z.tables.length };
    });
  }, [zones, allotments]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Table Allotment</h1>
          <p className="text-slate-500">Every table for the day, hour by hour. Click <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-xs font-mono">+</kbd> on a free slot to block it, or click any booking to edit/move/cancel.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Bulk Cancel Button */}
          {allotments.length > 0 && (
            <button
              onClick={() => setModal({ kind: 'bulk-cancel', date: day })}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Bulk Cancel
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowBlockMenu(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-[#b1b94c] text-black font-medium rounded-xl hover:bg-[#9da53f] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Block
              <ChevronDown className="w-4 h-4" />
            </button>
            {showBlockMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowBlockMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <button
                    onClick={() => { setModal({ kind: 'create', date: day }); setShowBlockMenu(false); }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100"
                  >
                    <Plus className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-medium text-slate-800">Single Table</div>
                      <div className="text-xs text-slate-500">Block one table at a time slot</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setModal({ kind: 'zone-block', date: day }); setShowBlockMenu(false); }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-center gap-3"
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-medium text-slate-800">Entire Zone</div>
                      <div className="text-xs text-slate-500">Block all tables in a zone</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Day selector */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center justify-between gap-4">
        <button
          onClick={() => setDay(shiftDay(day, -1))}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-3 flex-1 justify-center">
          <Calendar className="w-5 h-5 text-[#b1b94c]" />
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="relative px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 font-medium cursor-pointer hover:border-[#b1b94c] transition-colors"
          >
            {formatDateDisplay(day)}
            <input
              ref={dateInputRef}
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
            />
          </button>
          <button
            onClick={() => setDay(todayIsoBangkok())}
            className="text-sm text-[#1a237e] underline hover:no-underline"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => setDay(shiftDay(day, 1))}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* Compact zone summary pills */}
      {!loading && zoneStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-slate-500 mr-1">Today:</span>
          {zoneStats.map(s => {
            const ratio = s.booked / s.total;
            const color =
              s.booked === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              ratio >= 1     ? 'bg-red-50 text-red-700 border-red-200' :
              ratio >= 0.5   ? 'bg-amber-50 text-amber-700 border-amber-200' :
                               'bg-blue-50 text-blue-700 border-blue-200';
            return (
              <a
                key={s.zoneId}
                href={`#zone-${s.zoneId}`}
                className={`px-3 py-1 rounded-full border text-xs font-medium ${color} hover:scale-105 transition-transform`}
              >
                {s.name} <span className="opacity-70 ml-1">{s.booked}/{s.total}</span>
              </a>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Timelines */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#b1b94c] inline" />
        </div>
      ) : zones.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-500">No zones configured</div>
      ) : (
        <div className="space-y-4">
          {zones.map(zone => (
            <ZoneTimelineCard
              key={zone.id}
              zone={zone}
              day={day}
              allotments={allotments}
              onCellClick={(zoneId, time, tableCode) => setModal({ kind: 'create', zoneId, date: day, time, tableCode })}
              onBlockClick={(a) => setModal({ kind: 'manage', allotment: a })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal.kind === 'create' && (
        <BlockModal
          mode="create"
          initialZoneId={modal.zoneId}
          initialDate={modal.date ?? day}
          initialTime={modal.time}
          initialTableCode={modal.tableCode}
          zones={zones}
          allotments={allotments}
          onClose={() => setModal({ kind: 'closed' })}
          onSuccess={() => { refresh(); setModal({ kind: 'closed' }); }}
        />
      )}
      {modal.kind === 'manage' && (
        <BlockModal
          mode="manage"
          allotment={modal.allotment}
          zones={zones}
          allotments={allotments}
          onClose={() => setModal({ kind: 'closed' })}
          onSuccess={() => { refresh(); setModal({ kind: 'closed' }); }}
        />
      )}
      {modal.kind === 'zone-block' && (
        <ZoneBlockModal
          initialDate={modal.date}
          zones={zones}
          allotments={allotments}
          onClose={() => setModal({ kind: 'closed' })}
          onSuccess={() => { refresh(); setModal({ kind: 'closed' }); }}
        />
      )}
      {modal.kind === 'bulk-cancel' && (
        <BulkCancelModal
          date={modal.date}
          zones={zones}
          allotments={allotments}
          onClose={() => setModal({ kind: 'closed' })}
          onSuccess={() => { refresh(); setModal({ kind: 'closed' }); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZoneTimelineCard — one card per zone, with table rows and hour columns
// ─────────────────────────────────────────────────────────────────────────────

function ZoneTimelineCard({
  zone,
  day,
  allotments,
  onCellClick,
  onBlockClick,
}: {
  zone: ZoneWithTables;
  day: string;
  allotments: TmAllotment[];
  onCellClick: (zoneId: string, time: string, tableCode: string) => void;
  onBlockClick: (a: TmAllotment) => void;
}) {
  // Allotments scoped to this zone (we'll filter per-table inside)
  const zoneBlocks = useMemo(
    () => allotments.filter(a => a.zone_id === zone.id),
    [allotments, zone.id]
  );
  const blocksToday = zoneBlocks.length;
  const blockHours = Math.round(zone.block_minutes / 60);
  const sourceCounts = useMemo(() => {
    const counts: Partial<Record<AllotmentSource, number>> = {};
    for (const a of zoneBlocks) counts[a.source] = (counts[a.source] ?? 0) + 1;
    return counts;
  }, [zoneBlocks]);

  return (
    <div id={`zone-${zone.id}`} className="bg-white rounded-2xl shadow-sm overflow-hidden scroll-mt-4">
      {/* Zone header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-slate-800">{zone.name}</h3>
          <p className="text-xs text-slate-500">
            {zone.tables.length} tables · {blockHours}h block · slots {zone.time_slots.join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{blocksToday} {blocksToday === 1 ? 'block' : 'blocks'} today</span>
          {Object.entries(sourceCounts).map(([src, cnt]) => {
            const style = SOURCE_STYLE[src as AllotmentSource];
            return (
              <span key={src} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${style.pill}`}>
                {src.replace('_', '-')} {cnt}
              </span>
            );
          })}
        </div>
      </div>

      {/* Timeline grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-medium text-slate-600 min-w-[80px] border-r border-slate-200">Table</th>
              {HOURS.map(h => (
                <th key={h} className="px-1 py-2 text-center font-medium text-slate-500 min-w-[50px]">{hourLabel(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zone.tables.map((table, rowIdx) => (
              <tr key={table} className={rowIdx % 2 === 1 ? 'bg-slate-50/40' : ''}>
                <th className={`sticky left-0 z-10 ${rowIdx % 2 === 1 ? 'bg-slate-50' : 'bg-white'} px-3 py-1.5 text-left font-medium text-slate-700 whitespace-nowrap border-r border-slate-200`}>
                  {table}
                </th>
                {renderHourCells({
                  zone,
                  table,
                  blocks: zoneBlocks.filter(b => b.table_code === table),
                  day,
                  onCellClick,
                  onBlockClick,
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cell renderer — walks the hour axis and emits <td>s with appropriate colspan
// for booked blocks. Skips cells covered by an earlier spanning block.
// ─────────────────────────────────────────────────────────────────────────────

function renderHourCells({
  zone,
  table,
  blocks,
  day,
  onCellClick,
  onBlockClick,
}: {
  zone: ZoneWithTables;
  table: string;
  blocks: TmAllotment[];
  day: string;
  onCellClick: (zoneId: string, time: string, tableCode: string) => void;
  onBlockClick: (a: TmAllotment) => void;
}): React.ReactElement[] {
  const cells: React.ReactElement[] = [];
  const blockHours = Math.round(zone.block_minutes / 60);

  let h = HOURS[0];
  while (h <= HOURS[HOURS.length - 1]) {
    const hourStr = hourLabel(h);
    const cellStart = new Date(`${day}T${hourStr}:00+07:00`);
    const cellEnd = new Date(cellStart.getTime() + 60 * 60_000);

    // 1) Does a block START at this exact hour for this table on this day?
    //    (Match by Bangkok hour AND date)
    const startsHere = blocks.find(b => {
      const bDate = bkkDateISO(b.start_at);
      const bHour = bkkHourOf(b.start_at);
      return bDate === day && bHour === h;
    });

    if (startsHere) {
      const span = Math.min(blockHours, HOURS[HOURS.length - 1] - h + 1);
      const style = SOURCE_STYLE[startsHere.source];
      const customerLabel = startsHere.customer_name || (startsHere.source === 'walk_in' ? 'Walk-in' : 'Block');
      const ref = startsHere.booking_ref;
      const deposit = startsHere.deposit_amount;
      const timeRange = `${formatTimeBKK(startsHere.start_at)}–${formatTimeBKK(startsHere.end_at)}`;
      const titleParts = [
        ref ? `REF ${ref}` : null,
        customerLabel,
        deposit != null ? `Deposit ฿${Number(deposit).toLocaleString('en-US')}` : null,
        timeRange,
        startsHere.notes ? `Note: ${startsHere.notes}` : null,
      ].filter(Boolean);
      cells.push(
        <td key={`b-${h}`} colSpan={span} className="p-0.5">
          <button
            onClick={() => onBlockClick(startsHere)}
            className={`w-full min-h-[44px] py-1 rounded ${style.bg} ${style.text} border-l-4 ${style.border} px-2 text-left hover:brightness-95 transition-all overflow-hidden`}
            title={`${titleParts.join(' · ')} — click to manage`}
          >
            {/* Line 1: REF (if any) + customer name + time range right-aligned */}
            <div className="flex items-center gap-1.5 leading-tight">
              {ref && (
                <span className="font-mono text-[10px] font-bold bg-white/60 px-1 py-px rounded">
                  {ref}
                </span>
              )}
              <span className="font-semibold truncate flex-1 text-[11px]">{customerLabel}</span>
              <span className="text-[10px] opacity-70 whitespace-nowrap">{timeRange}</span>
            </div>
            {/* Line 2: deposit + guest count (only if any present) */}
            {(deposit != null || startsHere.guest_count != null) && (
              <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80 leading-tight">
                {deposit != null && (
                  <span className="font-medium">฿{Number(deposit).toLocaleString('en-US')} deposit</span>
                )}
                {startsHere.guest_count != null && (
                  <span>· {startsHere.guest_count} {startsHere.guest_count === 1 ? 'guest' : 'guests'}</span>
                )}
              </div>
            )}
          </button>
        </td>
      );
      h += span;
      continue;
    }

    // 2) Is this cell covered by an EARLIER block on this same date?
    const coveredByEarlier = blocks.find(b => {
      const bDate = bkkDateISO(b.start_at);
      if (bDate !== day) return false;
      const bs = new Date(b.start_at);
      const be = new Date(b.end_at);
      return bs < cellStart && be > cellStart;
    });
    if (coveredByEarlier) {
      // Skip — the spanning block from earlier already covered this cell.
      // We don't emit a <td> because the colspan handled it.
      h += 1;
      continue;
    }

    // 3) Is this hour a valid slot start for the zone?
    const isValidSlot = zone.time_slots.includes(hourStr);

    if (isValidSlot) {
      cells.push(
        <td key={`f-${h}`} className="p-0.5">
          <button
            onClick={() => onCellClick(zone.id, hourStr, table)}
            className="group w-full h-8 rounded border border-dashed border-slate-200 text-slate-300 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center"
            title={`Block ${table} at ${hourStr}`}
          >
            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </td>
      );
    } else {
      cells.push(
        <td key={`n-${h}`} className="p-0.5">
          <div className="w-full h-8 rounded bg-slate-50 text-slate-300 text-center flex items-center justify-center text-[10px]" title={`${zone.name} doesn't operate at ${hourStr}`}>—</div>
        </td>
      );
    }
    void cellEnd;
    h += 1;
  }
  return cells;
}

// ─────────────────────────────────────────────────────────────────────────────
// BlockModal — create OR manage (edit / move / delete)
// ─────────────────────────────────────────────────────────────────────────────

type BlockModalProps = {
  zones: ZoneWithTables[];
  allotments: TmAllotment[];
  onClose: () => void;
  onSuccess: () => void;
} & (
  | { mode: 'create'; initialZoneId?: string; initialDate: string; initialTime?: string; initialTableCode?: string }
  | { mode: 'manage'; allotment: TmAllotment }
);

function BlockModal(props: BlockModalProps) {
  const { zones, allotments, onClose, onSuccess } = props;
  const isManage = props.mode === 'manage';

  const initial = (() => {
    if (props.mode === 'manage') {
      return {
        zone_id: props.allotment.zone_id,
        table_code: props.allotment.table_code,
        date: bkkDateISO(props.allotment.start_at),
        time: `${pad2(bkkHourOf(props.allotment.start_at))}:00`,
        source: props.allotment.source as AllotmentSource,
        customer_name: props.allotment.customer_name ?? '',
        guest_count: props.allotment.guest_count?.toString() ?? '',
        notes: props.allotment.notes ?? '',
        deposit_amount: props.allotment.deposit_amount?.toString() ?? '',
      };
    }
    return {
      zone_id: props.initialZoneId ?? '',
      table_code: props.initialTableCode ?? '',
      date: props.initialDate,
      time: props.initialTime ?? '',
      source: 'phone' as AllotmentSource,
      customer_name: '',
      guest_count: '',
      notes: '',
      deposit_amount: '',
    };
  })();

  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const zoneObj = zones.find(z => z.id === form.zone_id);
  const timeOptions = zoneObj?.time_slots ?? [];

  const availableTables = useMemo(() => {
    if (!form.zone_id || !form.time || !form.date || !zoneObj) return null;
    const slotStart = new Date(`${form.date}T${form.time}:00+07:00`);
    const slotEnd = new Date(slotStart.getTime() + zoneObj.block_minutes * 60_000);
    const blocked = new Set(
      allotments
        .filter(a =>
          a.zone_id === form.zone_id &&
          (isManage ? a.id !== (props as { allotment: TmAllotment }).allotment.id : true) &&
          new Date(a.start_at) < slotEnd &&
          new Date(a.end_at)   > slotStart
        )
        .map(a => a.table_code)
    );
    return zoneObj.tables.map(t => ({ code: t, free: !blocked.has(t) }));
  }, [zones, allotments, form.zone_id, form.date, form.time, isManage, props, zoneObj]);

  const hasMovedFields = isManage && (() => {
    const orig = (props as { allotment: TmAllotment }).allotment;
    return (
      form.zone_id !== orig.zone_id ||
      form.date !== bkkDateISO(orig.start_at) ||
      form.time !== `${pad2(bkkHourOf(orig.start_at))}:00` ||
      (form.table_code || null) !== orig.table_code
    );
  })();

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!form.zone_id || !form.date || !form.time || !form.source) {
      setSubmitError('Please fill in zone, date, time, and source.');
      return;
    }
    setSubmitting(true);
    try {
      if (isManage) {
        const allotment = (props as { allotment: TmAllotment }).allotment;
        const body: Record<string, unknown> = {
          source: form.source,
          customer_name: form.customer_name || null,
          guest_count: form.guest_count ? Number(form.guest_count) : null,
          notes: form.notes || null,
          deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
        };
        if (hasMovedFields) {
          body.zone_id = form.zone_id;
          body.date = form.date;
          body.time = form.time;
          if (form.table_code) body.table_code = form.table_code;
        }
        const res = await adminFetch(`/api/admin/allotment/${allotment.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to update');
      } else {
        const res = await adminPost('/api/admin/allotment', {
          zone_id: form.zone_id,
          date: form.date,
          time: form.time,
          table_code: form.table_code || null,
          source: form.source,
          customer_name: form.customer_name || null,
          guest_count: form.guest_count ? Number(form.guest_count) : null,
          notes: form.notes || null,
          deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to create');
      }
      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isManage) return;
    if (!confirm('Remove this block? The table will become available again.')) return;
    const allotment = (props as { allotment: TmAllotment }).allotment;
    setDeleting(true);
    try {
      const res = await adminDelete(`/api/admin/allotment/${allotment.id}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Failed to delete');
      }
      onSuccess();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const manageTitle = isManage ? (() => {
    const a = (props as { allotment: TmAllotment }).allotment;
    return `${a.table_code} · ${bkkDateISO(a.start_at)} ${formatTimeBKK(a.start_at)}`;
  })() : '';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {isManage ? 'Manage Block' : 'Add Manual Block'}
            </h3>
            {isManage && <p className="text-xs text-slate-500 mt-0.5">{manageTitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Zone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Zone <span className="text-red-500">*</span></label>
            <select
              value={form.zone_id}
              onChange={(e) => setForm(f => ({ ...f, zone_id: e.target.value, table_code: '', time: '' }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] bg-white"
            >
              <option value="">Choose zone…</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name} ({z.tables.length} tables)</option>
              ))}
            </select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Time <span className="text-red-500">*</span></label>
              <select
                value={form.time}
                onChange={(e) => setForm(f => ({ ...f, time: e.target.value, table_code: '' }))}
                disabled={!form.zone_id}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] bg-white disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">{form.zone_id ? 'Choose time…' : 'Pick zone first'}</option>
                {timeOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table — visual grid */}
          {availableTables && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Table</label>
                <span className="text-xs text-slate-500">
                  {availableTables.filter(t => t.free).length} / {availableTables.length} free
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, table_code: '' }))}
                className={`w-full mb-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  form.table_code === ''
                    ? 'bg-[#b1b94c]/15 border-[#b1b94c] text-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {form.table_code === '' && <span className="w-2 h-2 rounded-full bg-[#b1b94c]" />}
                Auto-pick first free table
              </button>
              <p className="text-xs text-slate-500 mb-2">— or pick a specific one —</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {availableTables.map(t => {
                  const selected = form.table_code === t.code;
                  let cls: string;
                  if (!t.free) cls = 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed line-through';
                  else if (selected) cls = 'bg-blue-500 text-white border-blue-600 shadow-md scale-105';
                  else cls = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-400 cursor-pointer';
                  return (
                    <button
                      key={t.code}
                      type="button"
                      disabled={!t.free}
                      onClick={() => setForm(f => ({ ...f, table_code: t.code }))}
                      className={`px-2 py-2 rounded-md text-xs font-medium border transition-all ${cls}`}
                      title={t.free ? `Pick ${t.code}` : `${t.code} already blocked`}
                    >
                      {t.code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Source <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {SOURCES.map(s => {
                const Icon = s.icon;
                const selected = form.source === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, source: s.value }))}
                    className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 text-sm transition-colors ${
                      selected
                        ? 'border-[#b1b94c] bg-[#b1b94c]/10 text-slate-800 font-medium'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer + guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer name</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))}
                placeholder="(optional)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Guest count</label>
              <input
                type="number"
                min={1}
                value={form.guest_count}
                onChange={(e) => setForm(f => ({ ...f, guest_count: e.target.value }))}
                placeholder="(optional)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e]"
              />
            </div>
          </div>

          {/* Deposit + Booking REF (REF is read-only — set automatically for website bookings) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Deposit amount <span className="text-slate-400 font-normal">(THB)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.deposit_amount}
                  onChange={(e) => setForm(f => ({ ...f, deposit_amount: e.target.value }))}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Booking REF <span className="text-slate-400 font-normal">(read-only)</span>
              </label>
              <input
                type="text"
                value={isManage ? ((props as { allotment: TmAllotment }).allotment.booking_ref ?? '—') : '—'}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-default"
                title="Set automatically when a customer books via the website"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="(optional) Phone number, special requests, etc."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] resize-none"
            />
          </div>

          {isManage && hasMovedFields && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
              <Move className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                You&apos;ve changed the zone, date, time, or table — saving will <strong>move</strong> this block atomically.
                If the new slot is full, the original stays in place.
              </span>
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Block metadata display in manage mode */}
          {isManage && (
            <div className="text-xs text-slate-400 flex items-center gap-3 pt-1 flex-wrap">
              {(props as { allotment: TmAllotment }).allotment.notes && (
                <span className="flex items-center gap-1"><StickyNote className="w-3 h-3" />Existing note: {(props as { allotment: TmAllotment }).allotment.notes}</span>
              )}
              {(props as { allotment: TmAllotment }).allotment.guest_count != null && (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(props as { allotment: TmAllotment }).allotment.guest_count} guests</span>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          {isManage ? (
            <button
              onClick={handleDelete}
              disabled={deleting || submitting}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Block
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              disabled={submitting || deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || deleting || !form.zone_id || !form.date || !form.time}
              className="px-4 py-2 bg-[#b1b94c] text-black font-medium rounded-lg hover:bg-[#9da53f] disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isManage ? (hasMovedFields ? <><Move className="w-4 h-4" /> Move &amp; Save</> : <><Pencil className="w-4 h-4" /> Save Changes</>) : 'Block Table'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ZoneBlockModal — block all tables in a zone for selected time slots
// ─────────────────────────────────────────────────────────────────────────────

function ZoneBlockModal({
  initialDate,
  zones,
  allotments,
  onClose,
  onSuccess,
}: {
  initialDate: string;
  zones: ZoneWithTables[];
  allotments: TmAllotment[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    zone_id: '',
    date: initialDate,
    selectedSlots: [] as string[],
    blockType: 'all_day' as 'all_day' | 'custom_time',
    customStartTime: '10:00',
    customEndTime: '22:00',
    notes: 'Zone blocked by admin',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const zoneObj = zones.find(z => z.id === form.zone_id);
  const timeSlots = zoneObj?.time_slots ?? [];

  // Calculate available tables per slot
  const slotAvailability = useMemo(() => {
    if (!zoneObj) return {};
    const result: Record<string, { total: number; free: number; blocked: string[] }> = {};
    
    for (const slot of timeSlots) {
      const slotStart = new Date(`${form.date}T${slot}:00+07:00`);
      const slotEnd = new Date(slotStart.getTime() + zoneObj.block_minutes * 60_000);
      
      const blockedTables = allotments
        .filter(a =>
          a.zone_id === form.zone_id &&
          new Date(a.start_at) < slotEnd &&
          new Date(a.end_at) > slotStart
        )
        .map(a => a.table_code);
      
      const blockedSet = new Set(blockedTables);
      result[slot] = {
        total: zoneObj.tables.length,
        free: zoneObj.tables.filter(t => !blockedSet.has(t)).length,
        blocked: blockedTables,
      };
    }
    return result;
  }, [zoneObj, form.zone_id, form.date, allotments, timeSlots]);

  // Generate custom time slots based on start/end time
  const customSlots = useMemo(() => {
    if (form.blockType !== 'custom_time') return [];
    const startHour = parseInt(form.customStartTime.split(':')[0]);
    const endHour = parseInt(form.customEndTime.split(':')[0]);
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      const slot = `${pad2(h)}:00`;
      if (timeSlots.includes(slot)) {
        slots.push(slot);
      }
    }
    return slots;
  }, [form.blockType, form.customStartTime, form.customEndTime, timeSlots]);

  // Auto-select slots when block type or time range changes
  useEffect(() => {
    if (!form.zone_id) return;
    
    if (form.blockType === 'all_day') {
      // Select all available time slots
      const availableSlots = timeSlots.filter(slot => {
        const avail = slotAvailability[slot];
        return avail && avail.free > 0;
      });
      setForm(f => ({ ...f, selectedSlots: availableSlots }));
    } else if (form.blockType === 'custom_time') {
      // Select slots within the custom time range
      const availableSlots = customSlots.filter(slot => {
        const avail = slotAvailability[slot];
        return avail && avail.free > 0;
      });
      setForm(f => ({ ...f, selectedSlots: availableSlots }));
    }
  }, [form.zone_id, form.date, form.blockType, form.customStartTime, form.customEndTime, timeSlots, customSlots, slotAvailability]);

  const toggleSlot = (slot: string) => {
    setForm(f => ({
      ...f,
      selectedSlots: f.selectedSlots.includes(slot)
        ? f.selectedSlots.filter(s => s !== slot)
        : [...f.selectedSlots, slot],
    }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!form.zone_id || form.selectedSlots.length === 0) {
      setSubmitError('Please select a zone and at least one time slot.');
      return;
    }

    if (!zoneObj) return;

    // Calculate all tables to block
    const blocksToCreate: { table: string; slot: string }[] = [];
    for (const slot of form.selectedSlots) {
      const avail = slotAvailability[slot];
      if (!avail) continue;
      const freeTables = zoneObj.tables.filter(t => !avail.blocked.includes(t));
      for (const table of freeTables) {
        blocksToCreate.push({ table, slot });
      }
    }

    if (blocksToCreate.length === 0) {
      setSubmitError('All tables in the selected slots are already blocked.');
      return;
    }

    setSubmitting(true);
    setProgress({ current: 0, total: blocksToCreate.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < blocksToCreate.length; i++) {
      const { table, slot } = blocksToCreate[i];
      try {
        const res = await adminPost('/api/admin/allotment', {
          zone_id: form.zone_id,
          date: form.date,
          time: slot,
          table_code: table,
          source: 'admin',
          notes: form.notes || 'Zone blocked by admin',
        });
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
      setProgress({ current: i + 1, total: blocksToCreate.length });
    }

    setSubmitting(false);
    setProgress(null);

    if (failCount > 0) {
      setSubmitError(`Created ${successCount} blocks, ${failCount} failed.`);
    }
    
    if (successCount > 0) {
      onSuccess();
    }
  };

  const totalBlocksToCreate = useMemo(() => {
    if (!zoneObj) return 0;
    let count = 0;
    for (const slot of form.selectedSlots) {
      const avail = slotAvailability[slot];
      if (avail) count += avail.free;
    }
    return count;
  }, [zoneObj, form.selectedSlots, slotAvailability]);

  // Generate time options for dropdowns
  const timeOptions = HOURS.map(h => ({
    value: `${pad2(h)}:00`,
    label: `${pad2(h)}:00`,
  }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#b1b94c]" />
              Block Entire Zone
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Block all available tables in a zone at once</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Zone Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Zone <span className="text-red-500">*</span></label>
            <select
              value={form.zone_id}
              onChange={(e) => setForm(f => ({ ...f, zone_id: e.target.value, selectedSlots: [] }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] bg-white"
            >
              <option value="">Choose zone to block…</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name} ({z.tables.length} tables)</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value, selectedSlots: [] }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e]"
            />
            <p className="text-xs text-slate-500 mt-1">{formatDayLabel(form.date)}</p>
          </div>

          {/* Block Type Selection */}
          {form.zone_id && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Time Selection <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, blockType: 'all_day', selectedSlots: [] }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.blockType === 'all_day'
                      ? 'border-[#b1b94c] bg-[#b1b94c]/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      form.blockType === 'all_day' ? 'border-[#b1b94c]' : 'border-slate-300'
                    }`}>
                      {form.blockType === 'all_day' && <div className="w-2 h-2 rounded-full bg-[#b1b94c]" />}
                    </div>
                    <span className="font-medium text-slate-800">All Day</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-6">Block all available time slots</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, blockType: 'custom_time', selectedSlots: [] }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.blockType === 'custom_time'
                      ? 'border-[#b1b94c] bg-[#b1b94c]/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      form.blockType === 'custom_time' ? 'border-[#b1b94c]' : 'border-slate-300'
                    }`}>
                      {form.blockType === 'custom_time' && <div className="w-2 h-2 rounded-full bg-[#b1b94c]" />}
                    </div>
                    <span className="font-medium text-slate-800">Custom Time</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-6">Select specific hours</p>
                </button>
              </div>

              {/* Custom Time Range Dropdowns */}
              {form.blockType === 'custom_time' && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">From</label>
                      <select
                        value={form.customStartTime}
                        onChange={(e) => setForm(f => ({ ...f, customStartTime: e.target.value, selectedSlots: [] }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b1b94c] bg-white text-sm font-medium"
                      >
                        {timeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">To</label>
                      <select
                        value={form.customEndTime}
                        onChange={(e) => setForm(f => ({ ...f, customEndTime: e.target.value, selectedSlots: [] }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#b1b94c] bg-white text-sm font-medium"
                      >
                        {timeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {parseInt(form.customStartTime) > parseInt(form.customEndTime) && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Start time should be before end time
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Time Slots Preview */}
          {form.zone_id && timeSlots.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Selected Time Slots
                  <span className="text-slate-400 font-normal ml-2">
                    ({form.selectedSlots.length} of {timeSlots.length})
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {timeSlots.map(slot => {
                  const avail = slotAvailability[slot];
                  const isSelected = form.selectedSlots.includes(slot);
                  const allBlocked = avail?.free === 0;
                  const isInRange = form.blockType === 'all_day' || customSlots.includes(slot);

                  let cls: string;
                  if (allBlocked) {
                    cls = 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed';
                  } else if (!isInRange) {
                    cls = 'bg-slate-50 text-slate-300 border-slate-100';
                  } else if (isSelected) {
                    cls = 'bg-[#b1b94c] text-black border-[#9da53f] font-medium shadow-sm';
                  } else {
                    cls = 'bg-white text-slate-700 border-slate-200 hover:border-[#b1b94c] hover:bg-[#b1b94c]/10 cursor-pointer';
                  }

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={allBlocked}
                      onClick={() => isInRange && !allBlocked && toggleSlot(slot)}
                      className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${cls}`}
                      title={allBlocked ? `All tables blocked at ${slot}` : `${avail?.free ?? 0}/${avail?.total ?? 0} tables free`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Click on individual slots to toggle selection
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason / Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g., Private event, Maintenance, VIP booking"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e]"
            />
          </div>

          {/* Summary */}
          {totalBlocksToCreate > 0 && (
            <div className="p-4 bg-[#b1b94c]/10 border border-[#b1b94c]/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-[#8a9139] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-slate-800">
                    <strong>{totalBlocksToCreate}</strong> table-blocks will be created
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Across <strong>{form.selectedSlots.length}</strong> time slot{form.selectedSlots.length !== 1 ? 's' : ''} in{' '}
                    <strong>{zoneObj?.name}</strong>
                  </p>
                  {form.blockType === 'custom_time' && (
                    <p className="text-slate-500 mt-1 text-xs">
                      Time range: {form.customStartTime} – {form.customEndTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between text-sm text-blue-800 mb-2">
                <span>Creating blocks...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.zone_id || form.selectedSlots.length === 0 || totalBlocksToCreate === 0}
            className="px-4 py-2 bg-[#b1b94c] text-black font-medium rounded-lg hover:bg-[#9da53f] disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Layers className="w-4 h-4" />
            )}
            Block {totalBlocksToCreate} Table{totalBlocksToCreate !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BulkCancelModal — cancel multiple blocks at once
// ─────────────────────────────────────────────────────────────────────────────

function BulkCancelModal({
  date,
  zones,
  allotments,
  onClose,
  onSuccess,
}: {
  date: string;
  zones: ZoneWithTables[];
  allotments: TmAllotment[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterZone, setFilterZone] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');
  const [filterTimeFrom, setFilterTimeFrom] = useState<string>('');
  const [filterTimeTo, setFilterTimeTo] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter allotments based on criteria
  const filteredAllotments = useMemo(() => {
    return allotments.filter(a => {
      if (filterZone && a.zone_id !== filterZone) return false;
      if (filterSource && a.source !== filterSource) return false;
      if (filterTimeFrom) {
        const blockHour = bkkHourOf(a.start_at);
        const fromHour = parseInt(filterTimeFrom.split(':')[0]);
        if (blockHour < fromHour) return false;
      }
      if (filterTimeTo) {
        const blockHour = bkkHourOf(a.start_at);
        const toHour = parseInt(filterTimeTo.split(':')[0]);
        if (blockHour > toHour) return false;
      }
      return true;
    });
  }, [allotments, filterZone, filterSource, filterTimeFrom, filterTimeTo]);

  // Group by zone for display
  const groupedByZone = useMemo(() => {
    const groups: Record<string, { zone: ZoneWithTables | undefined; blocks: TmAllotment[] }> = {};
    for (const a of filteredAllotments) {
      if (!groups[a.zone_id]) {
        groups[a.zone_id] = { zone: zones.find(z => z.id === a.zone_id), blocks: [] };
      }
      groups[a.zone_id].blocks.push(a);
    }
    return Object.values(groups).sort((a, b) => 
      (a.zone?.display_order ?? 0) - (b.zone?.display_order ?? 0)
    );
  }, [filteredAllotments, zones]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredAllotments.map(a => a.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const selectByZone = (zoneId: string) => {
    const zoneBlockIds = filteredAllotments.filter(a => a.zone_id === zoneId).map(a => a.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = zoneBlockIds.every(id => next.has(id));
      if (allSelected) {
        zoneBlockIds.forEach(id => next.delete(id));
      } else {
        zoneBlockIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to cancel ${selectedIds.size} block(s)? This cannot be undone.`)) return;

    setDeleting(true);
    setError(null);
    setProgress({ current: 0, total: selectedIds.size });

    const ids = Array.from(selectedIds);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < ids.length; i++) {
      try {
        const res = await adminDelete(`/api/admin/allotment/${ids[i]}`);
        if (res.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
      setProgress({ current: i + 1, total: ids.length });
    }

    setDeleting(false);
    setProgress(null);

    if (failCount > 0) {
      setError(`Cancelled ${successCount} blocks, ${failCount} failed.`);
    }

    if (successCount > 0) {
      onSuccess();
    }
  };

  const timeOptions = HOURS.map(h => ({ value: `${pad2(h)}:00`, label: `${pad2(h)}:00` }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Bulk Cancel Blocks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDateDisplay(date)} · {allotments.length} total blocks
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Zone</label>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">All zones</option>
                {zones.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">All sources</option>
                {SOURCES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
              <select
                value={filterTimeFrom}
                onChange={(e) => setFilterTimeFrom(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Any time</option>
                {timeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
              <select
                value={filterTimeTo}
                onChange={(e) => setFilterTimeTo(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white"
              >
                <option value="">Any time</option>
                {timeOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Select All ({filteredAllotments.length})
            </button>
            <button
              onClick={selectNone}
              className="px-3 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Clear Selection
            </button>
            <span className="text-xs text-slate-500 ml-auto">
              {selectedIds.size} selected
            </span>
          </div>
        </div>

        {/* Block list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {groupedByZone.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No blocks match the filters
            </div>
          ) : (
            groupedByZone.map(group => {
              const zoneBlockIds = group.blocks.map(b => b.id);
              const allSelected = zoneBlockIds.every(id => selectedIds.has(id));
              const someSelected = zoneBlockIds.some(id => selectedIds.has(id));
              
              return (
                <div key={group.zone?.id ?? 'unknown'} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={() => selectByZone(group.zone?.id ?? '')}
                        className="w-4 h-4 rounded border-slate-300 text-[#b1b94c] focus:ring-[#b1b94c]"
                      />
                      <span className="font-medium text-slate-800">{group.zone?.name ?? 'Unknown Zone'}</span>
                      <span className="text-xs text-slate-500">({group.blocks.length} blocks)</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {group.blocks.map(block => {
                      const isSelected = selectedIds.has(block.id);
                      const style = SOURCE_STYLE[block.source];
                      return (
                        <label
                          key={block.id}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-red-50/50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(block.id)}
                            className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{block.table_code}</span>
                              <span className="text-xs text-slate-500">
                                {formatTimeBKK(block.start_at)} – {formatTimeBKK(block.end_at)}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${style.pill}`}>
                                {block.source}
                              </span>
                            </div>
                            {(block.customer_name || block.notes) && (
                              <div className="text-xs text-slate-500 truncate mt-0.5">
                                {block.customer_name && <span>{block.customer_name}</span>}
                                {block.customer_name && block.notes && <span> · </span>}
                                {block.notes && <span className="opacity-70">{block.notes}</span>}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Progress */}
        {progress && (
          <div className="px-5 py-3 border-t border-slate-100 bg-red-50">
            <div className="flex items-center justify-between text-sm text-red-800 mb-2">
              <span>Cancelling blocks...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="px-5 py-3 bg-red-50 border-t border-red-200 text-sm text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            {selectedIds.size > 0 ? (
              <span className="text-red-600 font-medium">{selectedIds.size} block(s) will be cancelled</span>
            ) : (
              <span>Select blocks to cancel</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              disabled={deleting}
            >
              Close
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || selectedIds.size === 0}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Cancel {selectedIds.size > 0 ? selectedIds.size : ''} Block{selectedIds.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
