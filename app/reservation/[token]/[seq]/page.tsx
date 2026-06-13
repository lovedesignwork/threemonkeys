import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getManualBookingByPublicToken } from '@/lib/allotment/server';

export const dynamic = 'force-dynamic';

// Bangkok is UTC+7 (no DST).
const BKK_OFFSET_MS = 7 * 60 * 60 * 1000;
const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

function bkk(iso: string) {
  const d = new Date(new Date(iso).getTime() + BKK_OFFSET_MS);
  const s = d.toISOString();
  return {
    day: String(parseInt(s.slice(8, 10), 10)),
    month: MONTHS[parseInt(s.slice(5, 7), 10) - 1],
    year: s.slice(0, 4),
    time: s.slice(11, 16),
  };
}

const SOURCE_LABELS: Record<string, string> = {
  live_chat: 'LIVE CHAT',
  phone: 'PHONE',
  email: 'EMAIL',
  walk_in: 'WALK-IN',
  admin: 'OUR TEAM',
  website: 'WEBSITE',
  other: 'OUR TEAM',
};

const ZONE_NAMES: Record<string, string> = {
  'monkey-dome': 'Monkey Dome',
  'monkey-nest': 'Monkey Nest',
  'romantic-rooftop-luge': 'Romantic Rooftop',
};

function fmtMoney(n: number | null | undefined) {
  if (!n || n <= 0) return null;
  return new Intl.NumberFormat('en-US').format(n);
}

export async function generateMetadata(
  { params }: { params: Promise<{ token: string; seq: string }> }
): Promise<Metadata> {
  const { token } = await params;
  const booking = await getManualBookingByPublicToken(token).catch(() => null);
  if (!booking) return { title: 'Reservation — Three Monkeys', robots: { index: false } };
  return {
    title: `Booking Confirmed — Three Monkeys Restaurant`,
    description: `Reservation for ${booking.customer_name || 'our guest'} at Three Monkeys Restaurant.`,
    robots: { index: false, follow: false },
  };
}

export default async function ReservationTicketPage(
  { params }: { params: Promise<{ token: string; seq: string }> }
) {
  const { token } = await params;
  const booking = await getManualBookingByPublicToken(token).catch(() => null);
  if (!booking) notFound();

  const when = bkk(booking.start_at);
  const adult = booking.adult_count ?? null;
  const child = booking.child_count ?? null;
  const adultDisplay = adult != null ? String(adult) : (booking.guest_count != null ? String(booking.guest_count) : '-');
  const childDisplay = child != null && child > 0 ? String(child) : '-';
  const sourceLabel = SOURCE_LABELS[booking.source] ?? 'OUR TEAM';
  const code = booking.booking_ref || token.toUpperCase();
  const zone = booking.zone_name || (booking.zone_id ? (ZONE_NAMES[booking.zone_id] ?? booking.zone_id) : null);
  const deposit = fmtMoney(booking.deposit_amount);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-[#dfd92b] via-[#d6cf24] to-[#c4bd1e] py-6 px-4 sm:py-10 flex justify-center font-[family-name:var(--font-inter)]">
      <div className="w-full max-w-md">
        {/* Ticket card */}
        <div className="bg-[#e7e02f] rounded-3xl shadow-2xl shadow-black/20 overflow-hidden ring-1 ring-black/10">
          {/* Header */}
          <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center">
            <Image
              src="/images/threemonkeyslogo.png"
              alt="Three Monkeys Restaurant"
              width={88}
              height={88}
              className="mb-3 drop-shadow-sm"
              priority
            />
            <h1
              className="text-[#171717] font-[family-name:var(--font-oswald)] font-bold leading-none tracking-tight text-3xl sm:text-4xl"
            >
              YOUR BOOKING
              <br />
              IS CONFIRMED
            </h1>
            <p className="mt-2 text-xs sm:text-sm font-semibold tracking-[0.18em] text-[#171717]/70">
              VIA <span className="text-[#171717]">{sourceLabel}</span>
            </p>
          </div>

          {/* Primary details */}
          <div className="px-5 pb-6 space-y-4">
            {/* Code / Date / Time + Adult / Child */}
            <div className="grid grid-cols-3 gap-2.5">
              <Field label="CODE">
                <span className="text-lg font-bold text-[#171717] tracking-tight">{code}</span>
              </Field>
              <Field label="DATE">
                <span className="text-lg font-bold text-[#171717] leading-none">
                  {when.day} {when.month.slice(0, 3)}
                </span>
                <span className="block text-[10px] text-[#171717]/60 mt-0.5">{when.year}</span>
              </Field>
              <Field label="TIME">
                <span className="text-lg font-bold text-[#171717]">{when.time}</span>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="ADULT" value={adultDisplay} />
              <Stat label="CHILD" value={childDisplay} />
            </div>

            {/* Name / Phone */}
            <div className="grid grid-cols-1 gap-2.5">
              <Field label="NAME">
                <span className="text-base font-semibold text-[#171717]">
                  {booking.customer_name || 'Valued Guest'}
                </span>
              </Field>
              {booking.customer_phone && (
                <Field label="PHONE NO.">
                  <span className="text-base font-semibold text-[#171717]">{booking.customer_phone}</span>
                </Field>
              )}
            </div>

            {/* Table zone / Deposit */}
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="TABLE ZONE">
                <span className="text-base font-semibold text-[#171717] uppercase">{zone || '—'}</span>
              </Field>
              <Field label="DEPOSIT">
                {deposit ? (
                  <>
                    <span className="text-base font-semibold text-[#171717]">{deposit}</span>
                    <span className="block text-[10px] text-[#171717]/60 mt-0.5">Thai Baht</span>
                  </>
                ) : (
                  <span className="text-base font-semibold text-[#171717]">No deposit</span>
                )}
              </Field>
            </div>

            {/* Remark */}
            {booking.notes && (
              <div>
                <p className="text-[11px] font-bold tracking-[0.12em] text-[#171717]/60 mb-1.5">REMARK</p>
                <div className="bg-white/55 rounded-xl px-4 py-3">
                  <p className="text-sm text-[#171717] whitespace-pre-wrap leading-relaxed">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="pt-1">
              <p className="text-[11px] font-bold tracking-[0.12em] text-[#171717]/70 mb-2">TERMS &amp; CONDITIONS</p>
              <ul className="space-y-1.5 text-[11px] leading-snug text-[#171717]/80 list-disc pl-4">
                <li>In terms of cancellation, the deposit will not be refunded, but the customer can change or postpone the time and service date.</li>
                <li>The deposit can be redeemed for food and beverages.</li>
                <li>We recommend that customers arrive 15 minutes before their reservation time. Late arrivals may have the booking cancelled without further notice.</li>
                <li>Any changes must be informed at least 1 day before the service date.</li>
                <li>Pets are not allowed in the restaurant.</li>
                <li>Customers are requested to consume only food and drink purchased on the premises.</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#171717] px-6 py-5 text-center">
            <p className="text-[12px] text-white/70 leading-relaxed">
              If you have any more questions please feel free to contact us via LIVE CHAT or email:
            </p>
            <a
              href="mailto:enjoy@threemonkeysphuket.com"
              className="mt-1.5 inline-block text-[13px] font-semibold text-[#e7e02f] hover:underline"
            >
              enjoy@threemonkeysphuket.com
            </a>
          </div>
        </div>

        {/* Below-card note */}
        <p className="text-center text-[11px] text-[#171717]/50 mt-4">
          Please present this ticket on arrival · Three Monkeys Restaurant, Phuket
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/55 rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-bold tracking-[0.1em] text-[#171717]/55 mb-1">{label}</p>
      <div className="leading-tight">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/55 rounded-xl px-3 py-3 flex flex-col items-center justify-center text-center">
      <p className="text-[10px] font-bold tracking-[0.1em] text-[#171717]/55 mb-1">{label}</p>
      <span className="text-3xl font-extrabold text-[#171717] leading-none tabular-nums">{value}</span>
    </div>
  );
}
