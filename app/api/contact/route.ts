import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email/send-contact-email';
import { supabaseAdmin } from '@/lib/supabase/server';

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
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

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

    if (dbError) {
      console.error('Failed to store contact submission:', dbError);
    }

    const submissionId = insertedData?.id || crypto.randomUUID();

    await Promise.all([
      sendContactFormEmail({
        name,
        email,
        phone,
        subject,
        message,
      }),
      syncToOneBooking({
        id: submissionId,
        name,
        email,
        phone,
        subject,
        message,
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
