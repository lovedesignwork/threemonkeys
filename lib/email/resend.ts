import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/server';

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// For backward compatibility - lazy getter
export const resend = {
  get emails() {
    return getResend().emails;
  }
};

export const EMAIL_FROM = 'Three Monkeys <support@threemonkeys.com>';

// Parse comma-separated emails into array
export function parseEmails(emailString: string): string[] {
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0 && email.includes('@'));
}

// Get notification settings from database
export async function getNotificationSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'notifications')
      .single();

    if (error || !data) {
      return {
        emailNotifications: true,
        bookingNotificationEmails: 'booking@hanumanworldphuket.com',
        contactNotificationEmails: 'contact@hanumanworldphuket.com',
        sendCustomerConfirmation: true,
      };
    }

    return data.value as {
      emailNotifications: boolean;
      bookingNotificationEmails: string;
      contactNotificationEmails: string;
      sendCustomerConfirmation: boolean;
    };
  } catch {
    return {
      emailNotifications: true,
      bookingNotificationEmails: 'booking@threemonkeys.com',
      contactNotificationEmails: 'contact@threemonkeys.com',
      sendCustomerConfirmation: true,
    };
  }
}
