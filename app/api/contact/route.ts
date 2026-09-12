import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactFormEmail } from '@/lib/email/send-contact-email';
import { supabaseAdmin } from '@/lib/supabase/server';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().trim().max(254, 'Email must be 254 characters or fewer').email('Invalid email address'),
  phone: z.string().trim().max(50, 'Phone must be 50 characters or fewer').nullable().optional(),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or fewer'),
  message: z.string().trim().min(1, 'Message is required').max(10000, 'Message must be 10000 characters or fewer'),
});

async function syncToOneBooking(data: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.ONEBOOKING_API_KEY;
  const apiUrl = process.env.ONEBOOKING_API_URL || 'https://db.onebooking.co';

  if (!apiKey) {
    console.warn('[contact] ONEBOOKING_API_KEY not configured, skipping inquiry sync');
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/api/inquiries/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        source_inquiry_id: data.id,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone || undefined,
        subject: data.subject,
        message: data.message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[contact] OneBooking inquiry sync failed:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    console.log('[contact] Inquiry synced to OneBooking:', result.data?.inquiry_ref);
    return result;
  } catch (error) {
    console.error('[contact] OneBooking inquiry sync error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid contact details' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;
    const phone = parsed.data.phone || undefined;

    const { data: insertedData, error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'new',
      })
      .select('id')
      .single();

    if (dbError || !insertedData?.id) {
      console.error('Failed to store contact submission:', dbError);
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again later.' },
        { status: 500 }
      );
    }

    // A stored message is available to admins even if a notification service is
    // unavailable. Only start these follow-ups after persistence is confirmed.
    const followups = await Promise.allSettled([
      sendContactFormEmail({
        name,
        email,
        phone,
        subject,
        message,
      }),
      syncToOneBooking({
        id: insertedData.id,
        name,
        email,
        phone,
        subject,
        message,
      }),
    ]);

    for (const result of followups) {
      if (result.status === 'rejected') {
        console.error('[contact] Follow-up failed after saving submission:', insertedData.id, result.reason);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
