/**
 * OneBooking Integration Types
 * 
 * Type definitions for syncing bookings to the OneBooking Central Dashboard
 */

export type BookingSyncEvent = 
  | 'booking.created'
  | 'booking.updated'
  | 'booking.cancelled'
  | 'booking.refunded';

export interface CustomerData {
  name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  special_requests: string | null;
}

export interface TransportData {
  type: 'hotel_pickup' | 'self_arrange' | 'private' | null;
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

export interface BookingOrigin {
  ip: string;
  country_code: string;
  country_name: string;
}

export interface PaymentOrigin {
  country_code: string;
  country_name: string;
}

export interface BookingSyncPayload {
  event: BookingSyncEvent;
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
  promo_code?: string | null;
  notes?: string | null;
  // Three Monkeys allotment fields (additive — other websites send null).
  zone_id?: string | null;
  zone_name?: string | null;
  table_code?: string | null;
  // Origin tracking (matches Baboon's shape)
  booking_origin?: BookingOrigin | null;
  payment_origin?: PaymentOrigin | null;
}

export interface SyncSuccessResponse {
  success: true;
  booking_id: string;
  message: string;
}

export interface SyncErrorResponse {
  success: false;
  error: string;
  code: string;
}

export type SyncResponse = SyncSuccessResponse | SyncErrorResponse;

export interface WebhookInboundPayload {
  event: 'booking.updated' | 'booking.status_changed';
  source_booking_id: string;
  updated_fields: string[];
  data: {
    status?: string;
    admin_notes?: string;
    [key: string]: unknown;
  };
  updated_at: string;
  updated_by: string;
}

export interface SyncConfig {
  apiUrl: string;
  apiKey: string;
  websiteId: string;
}
