'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Mail, 
  CreditCard, 
  Bell,
  Save,
  Loader2,
  Check,
  ExternalLink,
  Code,
  BarChart3
} from 'lucide-react';
import { adminGet, adminPost } from '@/lib/auth/api-client';
import { CustomSelect } from '@/components/ui';

interface GeneralSettings {
  siteName: string;
  timezone: string;
  currency: string;
}

interface ContactSettings {
  email: string;
  phone: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  bookingNotificationEmails: string;
  contactNotificationEmails: string;
  sendCustomerConfirmation: boolean;
}

interface TrackingSettings {
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
  headerScripts: string;
  bodyScripts: string;
  footerScripts: string;
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [general, setGeneral] = useState<GeneralSettings>({
    siteName: 'Hanuman World Phuket',
    timezone: 'Asia/Bangkok',
    currency: 'THB',
  });

  const [contact, setContact] = useState<ContactSettings>({
    email: 'info@hanumanworldphuket.com',
    phone: '+66 76 391 222',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    bookingNotificationEmails: 'booking@hanumanworldphuket.com',
    contactNotificationEmails: 'contact@hanumanworldphuket.com',
    sendCustomerConfirmation: true,
  });

  const [tracking, setTracking] = useState<TrackingSettings>({
    gtmId: '',
    ga4Id: '',
    metaPixelId: '',
    headerScripts: '',
    bodyScripts: '',
    footerScripts: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await adminGet('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.general) setGeneral(data.general as GeneralSettings);
        if (data.contact) setContact(data.contact as ContactSettings);
        if (data.notifications) setNotifications(data.notifications as NotificationSettings);
        if (data.tracking) setTracking(data.tracking as TrackingSettings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminPost('/api/admin/settings', {
          general,
          contact,
          notifications,
          tracking,
        });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Configure your booking system</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1a237e]/10 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#1a237e]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">General Settings</h2>
              <p className="text-sm text-slate-500">Basic site configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
              <input
                type="text"
                value={general.siteName}
                onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
              <CustomSelect
                value={general.timezone}
                onChange={(value) => setGeneral({ ...general, timezone: value })}
                options={[
                  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (GMT+7)' },
                  { value: 'UTC', label: 'UTC' },
                  { value: 'Asia/Singapore', label: 'Asia/Singapore (GMT+8)' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <CustomSelect
                value={general.currency}
                onChange={(value) => setGeneral({ ...general, currency: value })}
                options={[
                  { value: 'THB', label: 'Thai Baht (THB)' },
                  { value: 'USD', label: 'US Dollar (USD)' },
                  { value: 'EUR', label: 'Euro (EUR)' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1a237e]/10 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#1a237e]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Contact Information</h2>
              <p className="text-sm text-slate-500">Business contact details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1a237e]/10 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#1a237e]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Booking Settings</h2>
              <p className="text-sm text-slate-500">Configure booking behavior</p>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-1">Always Open</p>
            <p className="text-sm text-green-700">
              Hanuman World accepts unlimited bookings with no capacity restrictions. All time slots are always available.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1a237e]/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#1a237e]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Email Notifications</h2>
              <p className="text-sm text-slate-500">Configure email recipients for bookings and contact submissions</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300"
                />
                <div>
                  <p className="font-medium text-slate-700">Enable Email Notifications</p>
                  <p className="text-sm text-slate-500">Send emails for new bookings and contacts</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sendCustomerConfirmation}
                  onChange={(e) => setNotifications({ ...notifications, sendCustomerConfirmation: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300"
                />
                <div>
                  <p className="font-medium text-slate-700">Customer Confirmation Emails</p>
                  <p className="text-sm text-slate-500">Send booking confirmation to customers</p>
                </div>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <label className="text-sm font-medium text-blue-800">Booking Notification Recipients</label>
                </div>
                <textarea
                  value={notifications.bookingNotificationEmails}
                  onChange={(e) => setNotifications({ ...notifications, bookingNotificationEmails: e.target.value })}
                  className="w-full px-4 py-2 border border-blue-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400 bg-white"
                  placeholder="booking@example.com, manager@example.com"
                  rows={2}
                />
                <p className="text-xs text-blue-600 mt-2">
                  These email addresses will receive notifications when a new booking is made. Separate multiple emails with commas.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-4 h-4 text-green-600" />
                  <label className="text-sm font-medium text-green-800">Contact Form Recipients</label>
                </div>
                <textarea
                  value={notifications.contactNotificationEmails}
                  onChange={(e) => setNotifications({ ...notifications, contactNotificationEmails: e.target.value })}
                  className="w-full px-4 py-2 border border-green-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400 bg-white"
                  placeholder="contact@example.com, support@example.com"
                  rows={2}
                />
                <p className="text-xs text-green-600 mt-2">
                  These email addresses will receive contact form submissions. Separate multiple emails with commas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1a237e]/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#1a237e]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Analytics & Tracking</h2>
              <p className="text-sm text-slate-500">Google Tag Manager, Analytics, and Meta Pixel</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                value={tracking.gtmId}
                onChange={(e) => setTracking({ ...tracking, gtmId: e.target.value })}
                placeholder="GTM-XXXXXXX"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Google Analytics 4 ID
              </label>
              <input
                type="text"
                value={tracking.ga4Id}
                onChange={(e) => setTracking({ ...tracking, ga4Id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Meta Pixel ID
              </label>
              <input
                type="text"
                value={tracking.metaPixelId}
                onChange={(e) => setTracking({ ...tracking, metaPixelId: e.target.value })}
                placeholder="XXXXXXXXXXXXXXXXX"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-slate-500" />
              <h3 className="font-medium text-slate-800">Custom Scripts</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Add custom tracking scripts or third-party integrations. Scripts will be injected into the page at the specified location.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Header Scripts (inside &lt;head&gt;)
                </label>
                <textarea
                  value={tracking.headerScripts}
                  onChange={(e) => setTracking({ ...tracking, headerScripts: e.target.value })}
                  placeholder="<!-- Paste your header scripts here -->"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Body Scripts (after opening &lt;body&gt;)
                </label>
                <textarea
                  value={tracking.bodyScripts}
                  onChange={(e) => setTracking({ ...tracking, bodyScripts: e.target.value })}
                  placeholder="<!-- Paste your body scripts here (e.g., GTM noscript) -->"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Footer Scripts (before closing &lt;/body&gt;)
                </label>
                <textarea
                  value={tracking.footerScripts}
                  onChange={(e) => setTracking({ ...tracking, footerScripts: e.target.value })}
                  placeholder="<!-- Paste your footer scripts here -->"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1a237e]/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#1a237e]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Payment Integration</h2>
              <p className="text-sm text-slate-500">Stripe payment configuration</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Stripe Connection</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Connected</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">
                Your Stripe account is connected and ready to accept payments.
              </p>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#1a237e] hover:underline"
              >
                Open Stripe Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Supabase Connection</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Connected</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">
                Your Supabase database is connected and syncing data.
              </p>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#1a237e] hover:underline"
              >
                Open Supabase Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
