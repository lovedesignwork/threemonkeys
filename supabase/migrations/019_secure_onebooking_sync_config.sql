-- Remove the historical embedded integration credential from existing databases.
-- Operators must provision app.onebooking_api_url (full HTTPS sync endpoint) and
-- app.onebooking_api_key through secure database configuration before applying.
-- Missing settings skip database sync and leave booking writes available.
-- This replaces the function only; it does not create or re-enable any trigger.
-- The historical key must be revoked/rotated separately at the receiving service.
CREATE OR REPLACE FUNCTION public.sync_booking_to_onebooking()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  request_id bigint;
  onebooking_api_url text := NULLIF(BTRIM(current_setting('app.onebooking_api_url', true)), '');
  onebooking_api_key text := NULLIF(BTRIM(current_setting('app.onebooking_api_key', true)), '');
  customer_record record;
  transport_record record;
  package_record record;
  addons_json jsonb;
  payload jsonb;
BEGIN
  -- Only sync when status is confirmed (new confirmation or update to confirmed)
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'confirmed') THEN

    -- Both settings are provisioned outside source control. Never send data or
    -- credentials to a legacy/default endpoint when configuration is missing.
    IF onebooking_api_url IS NULL OR onebooking_api_key IS NULL OR onebooking_api_url !~ '^https://' THEN
      RAISE WARNING 'OneBooking database sync is not configured; skipping booking sync';
      RETURN NEW;
    END IF;
    -- Get customer data
    SELECT first_name, last_name, email, phone, country_code
    INTO customer_record
    FROM public.booking_customers
    WHERE booking_id = NEW.id
    LIMIT 1;

    -- Get transport data
    SELECT transport_type, hotel_name, room_number, non_players, private_passengers, transport_cost
    INTO transport_record
    FROM public.booking_transport
    WHERE booking_id = NEW.id
    LIMIT 1;

    -- Get package data
    SELECT name, price
    INTO package_record
    FROM public.packages
    WHERE id = NEW.package_id
    LIMIT 1;

    -- Get addons as JSON array
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'name', pa.name,
        'quantity', ba.quantity,
        'unit_price', ba.unit_price
      )
    ), '[]'::jsonb)
    INTO addons_json
    FROM public.booking_addons ba
    LEFT JOIN public.promo_addons pa ON ba.addon_id = pa.id
    WHERE ba.booking_id = NEW.id;

    -- Build the payload matching OneBooking API expected structure
    payload := jsonb_build_object(
      'event', 'booking.created',
      'source_booking_id', NEW.id,
      'booking_ref', NEW.booking_ref,
      'package_name', COALESCE(package_record.name, 'Unknown Package'),
      'package_price', COALESCE(package_record.price, 0),
      'activity_date', NEW.activity_date,
      'time_slot', NEW.time_slot,
      'guest_count', NEW.guest_count,
      'total_amount', NEW.total_amount,
      'discount_amount', COALESCE(NEW.discount_amount, 0),
      'currency', COALESCE(NEW.currency, 'THB'),
      'status', NEW.status,
      'customer', CASE
        WHEN customer_record.email IS NOT NULL
        THEN jsonb_build_object(
          'name', CONCAT(COALESCE(customer_record.first_name, ''), ' ', COALESCE(customer_record.last_name, '')),
          'email', customer_record.email,
          'phone', customer_record.phone,
          'country_code', customer_record.country_code,
          'special_requests', NEW.admin_notes
        )
        ELSE NULL
      END,
      'transport', CASE
        WHEN transport_record.transport_type IS NOT NULL
        THEN jsonb_build_object(
          'type', transport_record.transport_type,
          'hotel_name', transport_record.hotel_name,
          'room_number', transport_record.room_number,
          'non_players', COALESCE(transport_record.non_players, 0),
          'private_passengers', COALESCE(transport_record.private_passengers, 0),
          'cost', COALESCE(transport_record.transport_cost, 0)
        )
        ELSE NULL
      END,
      'addons', addons_json,
      'stripe_payment_intent_id', NEW.stripe_payment_intent_id,
      'created_at', NEW.created_at
    );

    -- Make HTTP POST request to OneBooking Dashboard
    SELECT net.http_post(
      url := onebooking_api_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-API-Key', onebooking_api_key
      )::jsonb,
      body := payload
    ) INTO request_id;

    -- Log the request for debugging
    RAISE NOTICE 'OneBooking sync request_id: %, booking_ref: %', request_id, NEW.booking_ref;

  END IF;

  RETURN NEW;
END;
$$;
