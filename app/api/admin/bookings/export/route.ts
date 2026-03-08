import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, isAuthError } from '@/lib/auth/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const dateType = searchParams.get('dateType') || 'booking';

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        id,
        booking_ref,
        activity_date,
        time_slot,
        guest_count,
        status,
        total_amount,
        discount_amount,
        currency,
        stripe_payment_intent_id,
        created_at,
        packages:package_id (name),
        booking_customers (first_name, last_name, email, phone, country_code),
        booking_transport (transport_type, hotel_name, room_number),
        booking_addons (quantity, unit_price, promo_addons:addon_id (name))
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (dateFrom && dateTo) {
      const dateField = dateType === 'play' ? 'activity_date' : 'created_at';
      query = query.gte(dateField, dateFrom).lte(dateField, dateTo);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Export error:', error);
      return NextResponse.json({ error: 'Failed to export bookings' }, { status: 500 });
    }

    const csvHeaders = [
      'Booking Ref',
      'Status',
      'Activity Date',
      'Time Slot',
      'Guest Count',
      'Package',
      'Customer Name',
      'Email',
      'Phone',
      'Country',
      'Transport Type',
      'Hotel Name',
      'Room Number',
      'Add-ons',
      'Subtotal',
      'Discount',
      'Total Amount',
      'Currency',
      'Payment ID',
      'Booking Created',
    ];

    const csvRows = bookings?.map((booking) => {
      const customer = booking.booking_customers?.[0];
      const transport = booking.booking_transport?.[0];
      const addons = booking.booking_addons
        ?.map((a) => {
          const promoAddons = a.promo_addons as { name: string }[] | { name: string } | null;
          const addonName = Array.isArray(promoAddons) 
            ? promoAddons[0]?.name 
            : promoAddons?.name;
          return `${addonName || 'Unknown'} x${a.quantity}`;
        })
        .join('; ') || '';

      const packages = booking.packages as { name: string }[] | { name: string } | null;
      const packageName = Array.isArray(packages) ? packages[0]?.name : packages?.name;
      const subtotal = (booking.total_amount || 0) + (booking.discount_amount || 0);

      return [
        booking.booking_ref,
        booking.status,
        booking.activity_date,
        booking.time_slot,
        booking.guest_count,
        packageName || '',
        customer ? `${customer.first_name} ${customer.last_name}` : '',
        customer?.email || '',
        customer?.phone || '',
        customer?.country_code || '',
        transport?.transport_type || '',
        transport?.hotel_name || '',
        transport?.room_number || '',
        addons,
        subtotal,
        booking.discount_amount || 0,
        booking.total_amount,
        booking.currency,
        booking.stripe_payment_intent_id || '',
        new Date(booking.created_at).toLocaleString('en-GB', { 
          timeZone: 'Asia/Bangkok',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
      ];
    }) || [];

    const escapeCsvValue = (value: unknown): string => {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `bookings-export-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
