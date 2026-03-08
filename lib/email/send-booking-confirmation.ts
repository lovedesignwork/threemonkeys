import { resend, EMAIL_FROM, getNotificationSettings } from './resend';
import BookingConfirmationEmail from './templates/BookingConfirmation';

interface BookingData {
  customerEmail: string;
  customerName: string;
  bookingRef: string;
  packageName: string;
  activityDate: string;
  timeSlot: string;
  guestCount: number;
  totalAmount: number;
  hotelName?: string;
  roomNumber?: string;
  hasTransfer: boolean;
  isPrivateTransfer?: boolean;
  addons?: Array<{ name: string; quantity: number; price: number }>;
}

export async function sendBookingConfirmationEmail(data: BookingData) {
  const settings = await getNotificationSettings();
  
  if (!settings.emailNotifications || !settings.sendCustomerConfirmation) {
    console.log('Customer confirmation emails are disabled');
    return { success: true, skipped: true };
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: data.customerEmail,
      subject: `Booking Confirmed! Your Hanuman World Adventure #${data.bookingRef}`,
      react: BookingConfirmationEmail({
        customerName: data.customerName,
        bookingRef: data.bookingRef,
        packageName: data.packageName,
        activityDate: data.activityDate,
        timeSlot: data.timeSlot,
        guestCount: data.guestCount,
        totalAmount: data.totalAmount,
        hotelName: data.hotelName,
        roomNumber: data.roomNumber,
        hasTransfer: data.hasTransfer,
        isPrivateTransfer: data.isPrivateTransfer,
        addons: data.addons,
      }),
    });

    if (error) {
      console.error('Failed to send booking confirmation email:', error);
      return { success: false, error };
    }

    console.log('Booking confirmation email sent:', result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error };
  }
}
