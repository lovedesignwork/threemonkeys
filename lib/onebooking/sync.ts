/**
 * OneBooking Sync Service
 * 
 * Handles pushing booking data to the OneBooking Central Dashboard
 */

import type { 
  BookingSyncPayload, 
  BookingSyncEvent,
  SyncResponse,
  CustomerData,
  TransportData,
  AddonData 
} from './types';

const RETRY_DELAYS = [1000, 5000, 30000, 300000]; // 1s, 5s, 30s, 5min

const getConfig = () => ({
  apiUrl: process.env.ONEBOOKING_API_URL || '',
  apiKey: process.env.ONEBOOKING_API_KEY || '',
  // Support both WEBSITE_ID and ONEBOOKING_WEBSITE_ID for compatibility
  websiteId: process.env.WEBSITE_ID || process.env.ONEBOOKING_WEBSITE_ID || 'hanuman-world',
});

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Build the sync payload from booking data
 */
export function buildSyncPayload(
  event: BookingSyncEvent,
  booking: {
    id: string;
    booking_ref: string;
    activity_date: string;
    time_slot: string;
    guest_count: number;
    total_amount: number;
    discount_amount?: number;
    currency?: string;
    status: string;
    special_requests?: string | null;
    stripe_payment_intent_id?: string | null;
    created_at: string;
    packages?: {
      name: string;
      price: number;
    } | null;
    promo_code?: string | null;
    admin_notes?: string | null;
    zone_id?: string | null;
    zone_name?: string | null;
    table_code?: string | null;
    booking_origin?: import('./types').BookingOrigin | null;
    payment_origin?: import('./types').PaymentOrigin | null;
  },
  customer: CustomerData,
  transport: TransportData,
  addons: AddonData[]
): BookingSyncPayload {
  return {
    event,
    source_booking_id: booking.id,
    booking_ref: booking.booking_ref,
    package_name: booking.packages?.name || 'Unknown Package',
    package_price: booking.packages?.price || 0,
    activity_date: booking.activity_date,
    time_slot: booking.time_slot,
    guest_count: booking.guest_count,
    total_amount: booking.total_amount,
    discount_amount: booking.discount_amount || 0,
    currency: booking.currency || 'THB',
    status: booking.status,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      country_code: customer.country_code,
      // Prefer the resolved customer-level value (set by
      // pushBookingToOneBooking) — `booking.special_requests` is not a
      // real column in our schema.
      special_requests: customer.special_requests ?? booking.special_requests ?? null,
    },
    transport,
    addons,
    stripe_payment_intent_id: booking.stripe_payment_intent_id || null,
    created_at: booking.created_at,
    promo_code: booking.promo_code || null,
    notes: booking.admin_notes || null,
    zone_id: booking.zone_id ?? null,
    zone_name: booking.zone_name ?? null,
    table_code: booking.table_code ?? null,
    booking_origin: booking.booking_origin ?? null,
    payment_origin: booking.payment_origin ?? null,
  };
}

/**
 * Sync a booking to OneBooking Central
 */
export async function syncBookingToOneBooking(
  payload: BookingSyncPayload
): Promise<SyncResponse> {
  const config = getConfig();

  console.log('[OneBooking Sync] Config check:', {
    hasApiUrl: !!config.apiUrl,
    apiUrlPrefix: config.apiUrl ? config.apiUrl.substring(0, 30) + '...' : 'MISSING',
    hasApiKey: !!config.apiKey,
    apiKeyPrefix: config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'MISSING',
    websiteId: config.websiteId,
  });

  if (!config.apiUrl || !config.apiKey) {
    console.warn('[OneBooking Sync] Missing configuration - skipping sync');
    return {
      success: false,
      error: 'OneBooking integration not configured',
      code: 'NOT_CONFIGURED',
    };
  }

  const syncUrl = `${config.apiUrl}/api/bookings/sync`;
  console.log('[OneBooking Sync] Sending to:', syncUrl);
  console.log('[OneBooking Sync] Payload:', JSON.stringify(payload, null, 2));

  const response = await fetch(syncUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
    },
    body: JSON.stringify(payload),
  });

  let data;
  const responseText = await response.text();
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('[OneBooking Sync] Non-JSON response:', responseText);
    throw new Error(`API returned non-JSON: ${responseText.substring(0, 200)}`);
  }

  if (!response.ok) {
    console.error('[OneBooking Sync] API error:', {
      status: response.status,
      statusText: response.statusText,
      data,
    });
    const err = new Error(data.error || data.message || 'Sync failed') as Error & {
      status?: number;
      code?: string;
    };
    err.status = response.status;
    err.code = data.code;
    throw err;
  }

  return data as SyncResponse;
}

/**
 * Sync with automatic retry on failure
 */
export async function syncWithRetry(
  payload: BookingSyncPayload,
  attempt = 0,
  switchedToUpdate = false
): Promise<SyncResponse> {
  try {
    const result = await syncBookingToOneBooking(payload);
    
    if (result.success) {
      console.log(`[OneBooking Sync] Success: ${payload.booking_ref} -> ${result.booking_id}`);
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status = (error as { status?: number }).status;
    const code = (error as { code?: string }).code;
    
    // Skip retry if not configured
    if (errorMessage === 'OneBooking integration not configured') {
      return {
        success: false,
        error: errorMessage,
        code: 'NOT_CONFIGURED',
      };
    }
    
    // Duplicate booking: the record already exists on OneBooking.
    // Switch from booking.created -> booking.updated and retry immediately
    // (only once, to avoid loops).
    if (
      status === 409 &&
      code === 'DUPLICATE_BOOKING' &&
      payload.event === 'booking.created' &&
      !switchedToUpdate
    ) {
      console.log(
        `[OneBooking Sync] ${payload.booking_ref} already exists — retrying as booking.updated`
      );
      return syncWithRetry({ ...payload, event: 'booking.updated' }, attempt, true);
    }
    
    if (attempt < RETRY_DELAYS.length) {
      console.log(
        `[OneBooking Sync] Retry ${attempt + 1}/${RETRY_DELAYS.length} for ${payload.booking_ref} in ${RETRY_DELAYS[attempt]}ms`
      );
      await sleep(RETRY_DELAYS[attempt]);
      return syncWithRetry(payload, attempt + 1, switchedToUpdate);
    }
    
    console.error(`[OneBooking Sync] Failed after ${RETRY_DELAYS.length} retries:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      code: 'SYNC_FAILED',
    };
  }
}

/**
 * Sync a booking event (convenience wrapper)
 * Call this after booking confirmation in the Stripe webhook
 */
export async function pushBookingToOneBooking(
  event: BookingSyncEvent,
  bookingData: {
    id: string;
    booking_ref: string;
    activity_date: string;
    time_slot: string;
    guest_count: number;
    total_amount: number;
    discount_amount?: number;
    currency?: string;
    status: string;
    /**
     * Customer's typed note from checkout. Lives on
     * `booking_customers.special_requests` in our schema (NOT on bookings).
     * Callers can pass it either here at the top level or via
     * `customers.special_requests` — we read both for safety.
     */
    special_requests?: string | null;
    stripe_payment_intent_id?: string | null;
    created_at: string;
    packages?: { name: string; price: number } | null;
    customers?: {
      name: string;
      email: string;
      phone?: string | null;
      country_code?: string | null;
      special_requests?: string | null;
    } | null;
    transport_type?: string | null;
    hotel_name?: string | null;
    room_number?: string | null;
    non_players?: number;
    private_passengers?: number;
    transport_cost?: number;
    booking_addons?: Array<{
      quantity: number;
      unit_price: number;
      promo_addons?: { name: string } | null;
    }>;
    promo_code?: string | null;
    admin_notes?: string | null;
    zone_id?: string | null;
    zone_name?: string | null;
    table_code?: string | null;
    booking_origin?: import('./types').BookingOrigin | null;
    payment_origin?: import('./types').PaymentOrigin | null;
  }
): Promise<SyncResponse> {
  // Validate customer email exists before attempting sync
  if (!bookingData.customers?.email) {
    console.warn(`[OneBooking Sync] Skipping ${bookingData.booking_ref} - no customer email`);
    return {
      success: false,
      error: 'Customer email is required for sync',
      code: 'MISSING_CUSTOMER_EMAIL',
    };
  }

  // Resolve customer special_requests with a priority order so we never
  // drop it: prefer the dedicated field on customers, then the legacy
  // top-level alias.
  const customerSpecialRequests =
    bookingData.customers.special_requests ?? bookingData.special_requests ?? null;

  const customer: CustomerData = {
    name: bookingData.customers.name || 'Unknown',
    email: bookingData.customers.email,
    phone: bookingData.customers.phone || null,
    country_code: bookingData.customers.country_code || null,
    special_requests: customerSpecialRequests,
  };

  const transport: TransportData = {
    type: (bookingData.transport_type as TransportData['type']) || null,
    hotel_name: bookingData.hotel_name || null,
    room_number: bookingData.room_number || null,
    non_players: bookingData.non_players || 0,
    private_passengers: bookingData.private_passengers || 0,
    cost: bookingData.transport_cost || 0,
  };

  const addons: AddonData[] = (bookingData.booking_addons || []).map(addon => ({
    name: addon.promo_addons?.name || 'Unknown Addon',
    quantity: addon.quantity,
    unit_price: addon.unit_price,
  }));

  const payload = buildSyncPayload(
    event,
    bookingData,
    customer,
    transport,
    addons
  );

  // buildSyncPayload reads booking.booking_origin / payment_origin
  // already, but the typed booking arg above doesn't include them — so
  // forward explicitly on the final payload.
  payload.booking_origin = bookingData.booking_origin ?? null;
  payload.payment_origin = bookingData.payment_origin ?? null;

  return syncWithRetry(payload);
}

/**
 * Sync a manual allotment/booking to OneBooking Central
 * Used for admin-created bookings via the allotment system
 */
export async function pushManualAllotmentToOneBooking(
  event: BookingSyncEvent,
  allotment: {
    id: string;
    booking_ref?: string | null;
    zone_id: string;
    zone_name?: string | null;
    table_code: string;
    start_at: string; // ISO timestamp
    source: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
    guest_count?: number | null;
    adult_count?: number | null;
    child_count?: number | null;
    notes?: string | null;
    deposit_amount?: number | null;
    created_at: string;
  }
): Promise<SyncResponse> {
  // For manual allotments, email is optional but we need something to identify
  // If no email, we can still sync but mark it clearly
  const customerEmail = allotment.customer_email || `manual-${allotment.id}@threemonkeysrestaurant.local`;
  
  // Calculate total guest count
  const adultChildSum = (allotment.adult_count || 0) + (allotment.child_count || 0);
  const totalGuests = allotment.guest_count ?? (adultChildSum > 0 ? adultChildSum : 1);

  // Extract date and time from start_at
  const startDate = new Date(allotment.start_at);
  const activityDate = startDate.toISOString().split('T')[0];
  const timeSlot = startDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false,
    timeZone: 'Asia/Bangkok'
  });

  const customer: CustomerData = {
    name: allotment.customer_name || 'Walk-in Guest',
    email: customerEmail,
    phone: allotment.customer_phone || null,
    country_code: null,
    special_requests: allotment.notes || null,
  };

  const transport: TransportData = {
    type: null,
    hotel_name: null,
    room_number: null,
    non_players: 0,
    private_passengers: 0,
    cost: 0,
  };

  const payload: BookingSyncPayload = {
    event,
    source_booking_id: allotment.id,
    booking_ref: allotment.booking_ref || `TM-${allotment.id.slice(0, 8).toUpperCase()}`,
    package_name: `Manual Booking (${allotment.source})`,
    package_price: allotment.deposit_amount || 0,
    activity_date: activityDate,
    time_slot: timeSlot,
    guest_count: totalGuests,
    total_amount: allotment.deposit_amount || 0,
    discount_amount: 0,
    currency: 'THB',
    status: 'confirmed',
    customer,
    transport,
    addons: [],
    stripe_payment_intent_id: null,
    created_at: allotment.created_at,
    notes: allotment.notes || null,
    zone_id: allotment.zone_id,
    zone_name: allotment.zone_name || null,
    table_code: allotment.table_code,
    booking_origin: null,
    payment_origin: null,
    // Manual bookings: carry the channel/source so OneBooking can show it
    // as the booking origin (e.g. "Live Chat", "Phone") instead of a flag.
    booking_source: allotment.source || null,
  };

  return syncWithRetry(payload);
}
