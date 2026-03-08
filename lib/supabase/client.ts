import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug logging for env vars (will be visible in browser console)
if (typeof window !== 'undefined') {
  console.log('[Supabase] URL:', supabaseUrl);
  console.log('[Supabase] Anon key (first 50 chars):', supabaseAnonKey?.substring(0, 50));
  console.log('[Supabase] Anon key length:', supabaseAnonKey?.length);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string;
          name: string;
          price: number;
          duration: string;
          category: 'combined' | 'zipline' | 'roller' | 'skywalk' | 'slingshot' | 'luge';
          includes_meal: boolean;
          includes_transfer: boolean;
          stripe_product_id: string | null;
          stripe_price_id: string | null;
          is_active: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      promo_addons: {
        Row: {
          id: string;
          name: string;
          price: number;
          original_price: number;
          description: string | null;
          stripe_product_id: string | null;
          stripe_price_id: string | null;
          is_active: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          booking_ref: string;
          package_id: string;
          activity_date: string;
          time_slot: string;
          guest_count: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded' | 'partially_refunded';
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          total_amount: number;
          discount_amount: number;
          promo_code_id: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'booking_ref' | 'created_at' | 'updated_at'>;
      };
      booking_customers: {
        Row: {
          id: string;
          booking_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          country_code: string;
          special_requests: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_customers']['Row'], 'id' | 'created_at'>;
      };
      booking_addons: {
        Row: {
          id: string;
          booking_id: string;
          addon_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_addons']['Row'], 'id' | 'created_at'>;
      };
      booking_transport: {
        Row: {
          id: string;
          booking_id: string;
          transport_type: 'hotel_pickup' | 'self_arrange' | 'private';
          hotel_name: string | null;
          room_number: string | null;
          private_passengers: number;
          non_players: number;
          transport_cost: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['booking_transport']['Row'], 'id' | 'created_at'>;
      };
      time_slots: {
        Row: {
          id: string;
          slot_time: string;
          slot_date: string;
          max_capacity: number;
          current_bookings: number;
          is_blocked: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Record<string, unknown>;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'id' | 'updated_at'>;
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: 'new' | 'read' | 'replied' | 'archived';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contact_submissions']['Row'], 'id' | 'created_at'>;
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_order_amount: number;
          max_uses: number | null;
          current_uses: number;
          valid_from: string | null;
          valid_until: string | null;
          is_active: boolean;
          stripe_coupon_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['promo_codes']['Row'], 'id' | 'current_uses' | 'created_at' | 'updated_at'>;
      };
      refund_history: {
        Row: {
          id: string;
          booking_id: string;
          stripe_refund_id: string | null;
          amount: number;
          reason: string | null;
          refunded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['refund_history']['Row'], 'id' | 'created_at'>;
      };
    };
  };
};
