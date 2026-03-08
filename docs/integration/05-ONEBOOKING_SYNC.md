# 5. OneBooking Sync Library

Library for syncing bookings to the OneBooking Central Dashboard.

## File Location

Create this file at: `/lib/onebooking/sync.ts`

## Complete Implementation

```typescript
export type BookingSyncEvent = 'booking.created' | 'booking.updated' | 'booking.cancelled';

interface SyncResponse {
  success: boolean;
  booking_id?: string;
  error?: string;
  code?: string;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  special_requests?: string | null;
}

interface TransportData {
  type: string | null;
  hotel_name: string | null;
  room_number: string | null;
  non_players: number;
  private_passengers: number;
  cost: number;
}

interface AddonData {
  name: string;
  quantity: number;
  unit_price: number;
}

const getConfig = () => ({
  apiUrl: process.env.ONEBOOKING_API_URL || '',
  apiKey: process.env.ONEBOOKING_API_KEY || '',
  websiteId: process.env.WEBSITE_ID || '',
});

/**
 * Sync a booking to OneBooking Central Dashboard
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
  }
): Promise<SyncResponse> {
  const config = getConfig();

  // Log config for debugging (remove in production)
  console.log('[OneBooking Sync] Config:', {
    hasApiUrl: !!config.apiUrl,
    hasApiKey: !!config.apiKey,
    websiteId: config.websiteId,
  });

  // Check if OneBooking is configured
  if (!config.apiUrl || !config.apiKey) {
    console.warn('[OneBooking Sync] Not configured - skipping sync');
    return {
      success: false,
      error: 'OneBooking integration not configured',
      code: 'NOT_CONFIGURED',
    };
  }

  // Validate customer email exists
  if (!bookingData.customers?.email) {
    console.warn(`[OneBooking Sync] Skipping ${bookingData.booking_ref} - no customer email`);
    return {
      success: false,
      error: 'Customer email is required for sync',
      code: 'MISSING_CUSTOMER_EMAIL',
    };
  }

  // Build customer data
  const customer: CustomerData = {
    name: bookingData.customers.name || 'Unknown',
    email: bookingData.customers.email,
    phone: bookingData.customers.phone || null,
    country_code: bookingData.customers.country_code || null,
    special_requests: bookingData.special_requests || null,
  };

  // Build transport data
  const transport: TransportData = {
    type: bookingData.transport_type || null,
    hotel_name: bookingData.hotel_name || null,
    room_number: bookingData.room_number || null,
    non_players: bookingData.non_players || 0,
    private_passengers: bookingData.private_passengers || 0,
    cost: bookingData.transport_cost || 0,
  };

  // Build addons data
  const addons: AddonData[] = (bookingData.booking_addons || []).map(addon => ({
    name: addon.promo_addons?.name || 'Unknown Addon',
    quantity: addon.quantity,
    unit_price: addon.unit_price,
  }));

  // Build sync payload
  const payload = {
    event,
    website_id: config.websiteId,
    source_booking_id: bookingData.id,
    booking_ref: bookingData.booking_ref,
    package_name: bookingData.packages?.name || 'Unknown Package',
    package_price: bookingData.packages?.price || 0,
    activity_date: bookingData.activity_date,
    time_slot: bookingData.time_slot,
    guest_count: bookingData.guest_count,
    total_amount: bookingData.total_amount,
    discount_amount: bookingData.discount_amount || 0,
    currency: bookingData.currency || 'THB',
    status: bookingData.status,
    customer,
    transport,
    addons,
    stripe_payment_intent_id: bookingData.stripe_payment_intent_id || null,
    created_at: bookingData.created_at,
  };

  console.log('[OneBooking Sync] Sending payload for:', bookingData.booking_ref);

  try {
    const response = await fetch(`${config.apiUrl}/api/bookings/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('[OneBooking Sync] Non-JSON response:', responseText);
      throw new Error(`API returned non-JSON: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      console.error('[OneBooking Sync] API error:', {
        status: response.status,
        data,
      });
      throw new Error(data.error || data.message || 'Sync failed');
    }

    console.log(`[OneBooking Sync] Success: ${bookingData.booking_ref}`);
    return data as SyncResponse;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[OneBooking Sync] Failed for ${bookingData.booking_ref}:`, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      code: 'SYNC_FAILED',
    };
  }
}
```

---

## Types File (Optional)

Create `/lib/onebooking/types.ts`:

```typescript
export type BookingSyncEvent = 'booking.created' | 'booking.updated' | 'booking.cancelled';

export interface SyncResponse {
  success: boolean;
  booking_id?: string;
  error?: string;
  code?: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  special_requests?: string | null;
}

export interface TransportData {
  type: string | null;
  hotel_name: string | null;
  room_number: string | null;
  non_players: number;
  private_passengers: number;
  cost: number;
}

export interface AddonData {
  name: string;
  quantity: number;
  unit_price: number;
}

export interface BookingSyncPayload {
  event: BookingSyncEvent;
  website_id: string;
  source_booking_id: string;
  booking_ref: string;
  package_name: string;
  package_price: number;
  activity_date: string;
  time_slot: string;
  guest_count: number;
  total_amount: number;
  discount_amount: number;
  currency: string;
  status: string;
  customer: CustomerData;
  transport: TransportData;
  addons: AddonData[];
  stripe_payment_intent_id: string | null;
  created_at: string;
}
```

---

## Usage

The sync function is called from the Stripe webhook handler after a successful payment:

```typescript
// In webhook handler
const syncResult = await pushBookingToOneBooking('booking.created', {
  id: booking.id,
  booking_ref: booking.booking_ref,
  // ... other booking data
});

if (syncResult.success) {
  console.log('Booking synced to OneBooking');
} else {
  console.error('Sync failed:', syncResult.error);
}
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| `NOT_CONFIGURED` | Missing `ONEBOOKING_API_URL` or `ONEBOOKING_API_KEY` |
| `MISSING_CUSTOMER_EMAIL` | Customer email is required but missing |
| `DUPLICATE_BOOKING` | Booking already exists in OneBooking |
| `SYNC_FAILED` | API call failed |
