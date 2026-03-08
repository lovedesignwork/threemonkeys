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
      special_requests: booking.special_requests || customer.special_requests,
    },
    transport,
    addons,
    stripe_payment_intent_id: booking.stripe_payment_intent_id || null,
    created_at: booking.created_at,
    promo_code: booking.promo_code || null,
    notes: booking.admin_notes || null,
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
    throw new Error(data.error || data.message || 'Sync failed');
  }

  return data as SyncResponse;
}

/**
 * Sync with automatic retry on failure
 */
export async function syncWithRetry(
  payload: BookingSyncPayload,
  attempt = 0
): Promise<SyncResponse> {
  try {
    const result = await syncBookingToOneBooking(payload);
    
    if (result.success) {
      console.log(`[OneBooking Sync] Success: ${payload.booking_ref} -> ${result.booking_id}`);
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Skip retry if not configured
    if (errorMessage === 'OneBooking integration not configured') {
      return {
        success: false,
        error: errorMessage,
        code: 'NOT_CONFIGURED',
      };
    }
    
    if (attempt < RETRY_DELAYS.length) {
      console.log(
        `[OneBooking Sync] Retry ${attempt + 1}/${RETRY_DELAYS.length} for ${payload.booking_ref} in ${RETRY_DELAYS[attempt]}ms`
      );
      await sleep(RETRY_DELAYS[attempt]);
      return syncWithRetry(payload, attempt + 1);
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
    special_requests?: string | null;
    stripe_payment_intent_id?: string | null;
    created_at: string;
    packages?: { name: string; price: number } | null;
    customers?: {
      name: string;
      email: string;
      phone?: string | null;
      country_code?: string | null;
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

  const customer: CustomerData = {
    name: bookingData.customers.name || 'Unknown',
    email: bookingData.customers.email,
    phone: bookingData.customers.phone || null,
    country_code: bookingData.customers.country_code || null,
    special_requests: bookingData.special_requests || null,
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

  return syncWithRetry(payload);
}
