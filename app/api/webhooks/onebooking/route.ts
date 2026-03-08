import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import crypto from 'crypto';
import type { WebhookInboundPayload } from '@/lib/onebooking/types';

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  const secret = process.env.ONEBOOKING_WEBHOOK_SECRET;
  
  if (!secret || !signature || !timestamp) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-webhook-signature');
  const timestamp = request.headers.get('x-webhook-timestamp');

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature, timestamp)) {
    console.error('[OneBooking Webhook] Invalid signature');
    return NextResponse.json(
      { success: false, error: 'Invalid signature' },
      { status: 401 }
    );
  }

  let payload: WebhookInboundPayload;

  try {
    payload = JSON.parse(body);
  } catch {
    console.error('[OneBooking Webhook] Invalid JSON payload');
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const { event, source_booking_id, updated_fields, data } = payload;

  if (!source_booking_id) {
    return NextResponse.json(
      { success: false, error: 'Missing source_booking_id' },
      { status: 400 }
    );
  }

  console.log(`[OneBooking Webhook] Received ${event} for booking ${source_booking_id}`);

  try {
    switch (event) {
      case 'booking.updated':
      case 'booking.status_changed': {
        // Build update object from the data received
        const updateData: Record<string, unknown> = {};

        if (updated_fields.includes('status') && data.status) {
          updateData.status = data.status;
        }

        if (updated_fields.includes('admin_notes') && data.admin_notes !== undefined) {
          updateData.admin_notes = data.admin_notes;
        }

        // Only update if there's something to update
        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();

          const { error } = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', source_booking_id);

          if (error) {
            console.error('[OneBooking Webhook] Database update failed:', error);
            return NextResponse.json(
              { success: false, error: 'Database update failed' },
              { status: 500 }
            );
          }

          console.log(`[OneBooking Webhook] Updated booking ${source_booking_id}:`, updated_fields);
        }
        break;
      }

      default:
        console.log(`[OneBooking Webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated',
    });
  } catch (error) {
    console.error('[OneBooking Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'OneBooking Webhook Endpoint',
    website: 'hanuman-world',
    status: 'active',
  });
}
