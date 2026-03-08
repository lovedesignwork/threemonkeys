import { NextResponse } from 'next/server';
import { render } from '@react-email/components';
import BookingConfirmationEmail from '@/lib/email/templates/BookingConfirmation';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const emailHtml = await render(
    BookingConfirmationEmail({
      customerName: 'John',
      bookingRef: 'TM-00001',
      packageName: 'Royal Thai Tasting Menu',
      activityDate: 'Saturday, March 15, 2026',
      timeSlot: '7:00 PM',
      guestCount: 4,
      totalAmount: 11960,
      hotelName: 'Patong Beach Hotel',
      roomNumber: '302',
      hasTransfer: true,
      isPrivateTransfer: false,
      addons: [
        { name: 'Wine Pairing', quantity: 4, price: 800 },
        { name: 'Dessert Platter', quantity: 2, price: 770 },
      ],
    })
  );

  return new NextResponse(emailHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
