import { resend, EMAIL_FROM, parseEmails, getNotificationSettings } from './resend';
import NewBookingNotification from './templates/NewBookingNotification';

interface BookingAddon {
  name: string;
  quantity: number;
  price: number;
}

interface BookingNotificationData {
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageName: string;
  playDate: string;
  timeSlot: string;
  guests: number;
  additionalGuests?: number;
  transportType: 'none' | 'shared' | 'private';
  hotelName?: string;
  roomNumber?: string;
  privatePassengers?: number;
  addons?: BookingAddon[];
  totalAmount: number;
  paymentStatus: string;
}

export async function sendBookingNotificationEmail(data: BookingNotificationData) {
  const settings = await getNotificationSettings();
  
  if (!settings.emailNotifications) {
    console.log('Email notifications are disabled');
    return { success: true, skipped: true };
  }

  const recipients = parseEmails(settings.bookingNotificationEmails);
  
  if (recipients.length === 0) {
    console.log('No booking notification recipients configured');
    return { success: true, skipped: true };
  }

  const bookedAt = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: recipients,
      subject: `🎉 New Booking: ${data.bookingRef} - ${data.customerName}`,
      react: NewBookingNotification({
        ...data,
        bookedAt,
      }),
    });

    if (result.error) {
      console.error('Error sending booking notification:', result.error);
      throw new Error(result.error.message);
    }

    console.log(`Booking notification email sent for ${data.bookingRef} to ${recipients.join(', ')}`);
    return { success: true, emailId: result.data?.id };
  } catch (error) {
    console.error('Error in sendBookingNotificationEmail:', error);
    throw error;
  }
}
