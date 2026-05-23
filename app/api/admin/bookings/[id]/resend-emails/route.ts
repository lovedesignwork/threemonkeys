import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';
import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation';
import { sendBookingNotificationEmail } from '@/lib/email/send-booking-notification';
import { getZoneForPackage } from '@/lib/allotment/zones';

/**
 * Manually re-send the customer confirmation and admin notification
 * emails for a booking. Used when the original webhook delivery failed
 * (e.g. Resend outage, missing API key, template error).
 *
 * `id` may be either a UUID (bookings.id) or a booking_ref like 3M-000001.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const lookupColumn = isUuid ? 'id' : 'booking_ref';

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .select(`
      *,
      packages (*),
      booking_customers (*),
      booking_addons (*, promo_addons (*)),
      booking_transport (*)
    `)
    .eq(lookupColumn, id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const rawCustomer = booking.booking_customers;
  const customer = Array.isArray(rawCustomer) ? rawCustomer[0] : rawCustomer;
  const rawTransport = booking.booking_transport;
  const transport = Array.isArray(rawTransport) ? rawTransport[0] : rawTransport;

  if (!customer?.email) {
    return NextResponse.json(
      { error: 'Booking has no customer email on file' },
      { status: 400 },
    );
  }

  const activityDate = new Date(booking.activity_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formatTime = (time: string) => {
    if (!time || time === 'flexible') return 'Flexible (8AM-6PM)';
    const [h] = time.split(':');
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const addons = (booking.booking_addons || []).map(
    (addon: { promo_addons?: { name?: string } | null; quantity: number; unit_price: number }) => ({
      name: addon.promo_addons?.name || 'Add-on',
      quantity: addon.quantity,
      price: addon.unit_price,
    }),
  );

  const zoneName = getZoneForPackage(booking.package_id)?.zoneName ?? null;

  const result: {
    bookingRef: string;
    customer: { ok: boolean; error?: string };
    admin: { ok: boolean; error?: string };
  } = {
    bookingRef: booking.booking_ref,
    customer: { ok: false },
    admin: { ok: false },
  };

  try {
    await sendBookingConfirmationEmail({
      customerEmail: customer.email,
      customerName: customer.first_name,
      bookingRef: booking.booking_ref,
      packageName: booking.packages?.name || 'Dining Package',
      activityDate,
      timeSlot: formatTime(booking.time_slot),
      guestCount: booking.guest_count,
      totalAmount: booking.total_amount,
      hotelName: transport?.hotel_name,
      roomNumber: transport?.room_number,
      hasTransfer: !!transport,
      isPrivateTransfer: transport?.transport_type === 'private',
      addons,
      zoneName,
      specialRequests: customer.special_requests ?? null,
    });
    result.customer.ok = true;
  } catch (err) {
    console.error('[ResendEmails] Customer email failed:', err);
    result.customer.error = err instanceof Error ? err.message : String(err);
  }

  try {
    await sendBookingNotificationEmail({
      bookingRef: booking.booking_ref,
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerEmail: customer.email,
      customerPhone: customer.phone || '',
      packageName: booking.packages?.name || 'Dining Package',
      playDate: activityDate,
      timeSlot: formatTime(booking.time_slot),
      guests: booking.guest_count,
      additionalGuests: transport?.non_players || undefined,
      transportType: transport?.transport_type || 'none',
      hotelName: transport?.hotel_name || undefined,
      roomNumber: transport?.room_number || undefined,
      privatePassengers: transport?.private_passengers || undefined,
      addons,
      totalAmount: booking.total_amount,
      paymentStatus: booking.status,
    });
    result.admin.ok = true;
  } catch (err) {
    console.error('[ResendEmails] Admin email failed:', err);
    result.admin.error = err instanceof Error ? err.message : String(err);
  }

  const httpStatus = result.customer.ok || result.admin.ok ? 200 : 500;
  return NextResponse.json(result, { status: httpStatus });
}
