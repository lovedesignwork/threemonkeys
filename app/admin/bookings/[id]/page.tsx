'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  StickyNote,
  Save,
  History,
  Tag,
  Cloud
} from 'lucide-react';
import { adminGet, adminPost, adminPut } from '@/lib/auth/api-client';
interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
}

interface BookingDetail {
  id: string;
  booking_ref: string;
  activity_date: string;
  time_slot: string;
  guest_count: number;
  total_amount: number;
  discount_amount?: number;
  promo_code_id?: string | null;
  status: string;
  currency: string;
  stripe_payment_intent_id: string | null;
  admin_notes: string | null;
  created_at: string;
  packages: { id: string; name: string; price: number; duration: string };
  promo_codes?: PromoCode | null;
  booking_customers: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country_code: string;
    special_requests: string | null;
  }[];
  booking_transport: {
    transport_type: string;
    hotel_name: string | null;
    room_number: string | null;
    private_passengers: number;
    additional_guests: number;
    transport_cost: number;
  }[];
  booking_addons: {
    quantity: number;
    unit_price: number;
    promo_addons: { name: string };
  }[];
}

interface RefundRecord {
  id: string;
  amount: number;
  reason: string | null;
  stripe_refund_id: string | null;
  created_at: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  
  // Refund history (view only)
  const [refundHistory, setRefundHistory] = useState<RefundRecord[]>([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  
  // Sync to OneBooking
  const [syncingToOneBooking, setSyncingToOneBooking] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBooking();
    fetchRefundHistory();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const response = await adminGet(`/api/admin/bookings/${params.id}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setBooking(result.data);
      setAdminNotes(result.data?.admin_notes || '');
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAdminNotes = async () => {
    if (!booking) return;
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const response = await adminPut(`/api/admin/bookings/${booking.id}`, { admin_notes: adminNotes });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setBooking({ ...booking, admin_notes: adminNotes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const fetchRefundHistory = async () => {
    if (!params.id) return;
    setLoadingRefunds(true);
    try {
      const response = await adminGet(`/api/admin/refunds?bookingId=${params.id}`);
      const result = await response.json();
      if (response.ok) {
        setRefundHistory(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching refund history:', error);
    } finally {
      setLoadingRefunds(false);
    }
  };

  const totalRefunded = refundHistory.reduce((sum, r) => sum + r.amount, 0);
  const maxRefundable = booking ? booking.total_amount - totalRefunded : 0;

  const syncToOneBooking = async () => {
    if (!booking) return;
    setSyncingToOneBooking(true);
    setSyncMessage(null);
    try {
      const response = await adminPost('/api/admin/bookings/sync-to-onebooking', {
        bookingId: booking.id,
      });
      const result = await response.json();
      
      if (result.success) {
        setSyncMessage({ type: 'success', text: `Synced to OneBooking successfully!` });
      } else {
        setSyncMessage({ type: 'error', text: result.error || 'Sync failed' });
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage({ type: 'error', text: error instanceof Error ? error.message : 'Sync failed' });
    } finally {
      setSyncingToOneBooking(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Booking not found</h2>
        <Link href="/admin/bookings" className="text-[#1a237e] hover:underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  const customer = booking.booking_customers?.[0];
  const transport = booking.booking_transport?.[0];

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/bookings"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{booking.booking_ref}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          <p className="text-slate-500">Created on {new Date(booking.created_at).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Date</span>
                </div>
                <p className="font-medium text-slate-800">
                  {new Date(booking.activity_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Time</span>
                </div>
                <p className="font-medium text-slate-800">
                  {booking.time_slot === 'flexible' ? '8:00 AM - 6:00 PM (Flexible)' : booking.time_slot}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Guests</span>
                </div>
                <p className="font-medium text-slate-800">{booking.guest_count} person(s)</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">Total</span>
                </div>
                <p className="font-medium text-slate-800">{formatCurrency(booking.total_amount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Package</h2>
            <div className="flex items-center justify-between p-4 bg-[#1a237e]/5 rounded-xl">
              <div>
                <p className="font-semibold text-slate-800">{booking.packages?.name}</p>
                <p className="text-sm text-slate-500">{booking.packages?.duration}</p>
              </div>
              <p className="font-semibold text-[#1a237e]">
                {formatCurrency(booking.packages?.price)} x {booking.guest_count}
              </p>
            </div>

            {booking.booking_addons && booking.booking_addons.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Add-ons</h3>
                <div className="space-y-2">
                  {booking.booking_addons.map((addon, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-800">{addon.promo_addons?.name}</p>
                      <p className="text-sm text-slate-600">
                        {formatCurrency(addon.unit_price)} x {addon.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Code Applied */}
            {booking.promo_codes && booking.discount_amount && booking.discount_amount > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-green-800">Promo Code Applied</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-green-700 text-lg">{booking.promo_codes.code}</p>
                    <p className="text-sm text-green-600">
                      {booking.promo_codes.discount_type === 'percentage' 
                        ? `${booking.promo_codes.discount_value}% OFF`
                        : `${formatCurrency(booking.promo_codes.discount_value)} OFF`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">Discount</p>
                    <p className="font-bold text-green-700 text-lg">-{formatCurrency(booking.discount_amount)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            {booking.discount_amount && booking.discount_amount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(booking.total_amount + booking.discount_amount)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(booking.discount_amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 pt-2 border-t border-slate-200">
                    <span>Total Paid</span>
                    <span>{formatCurrency(booking.total_amount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {transport && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Transport</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Transport Type</p>
                    <p className="font-medium text-slate-800 capitalize">
                      {transport.transport_type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                {transport.hotel_name && (
                  <div className="ml-8">
                    <p className="text-sm text-slate-500">Hotel</p>
                    <p className="font-medium text-slate-800">
                      {transport.hotel_name} {transport.room_number && `(Room ${transport.room_number})`}
                    </p>
                  </div>
                )}
                {transport.additional_guests > 0 && (
                  <div className="ml-8">
                    <p className="text-sm text-slate-500">Additional Guests</p>
                    <p className="font-medium text-slate-800">{transport.additional_guests} person(s)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {customer?.special_requests && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Special Requests</h2>
              <p className="text-slate-600">{customer.special_requests}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Customer</h2>
            {customer ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium text-slate-800">{customer.first_name} {customer.last_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${customer.email}`} className="text-[#1a237e] hover:underline text-sm">
                    {customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${customer.country_code}${customer.phone}`} className="text-[#1a237e] hover:underline text-sm">
                    {customer.country_code} {customer.phone}
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No customer information</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Actions</h2>
            <div className="space-y-3">
              {/* Sync to OneBooking Button */}
              <button
                onClick={syncToOneBooking}
                disabled={syncingToOneBooking}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1a237e] hover:bg-[#0d1259] text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {syncingToOneBooking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
                Sync to OneBooking
              </button>

              {syncMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  syncMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {syncMessage.text}
                </div>
              )}

              {/* Info about editing */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> To edit bookings, confirm, cancel, send emails, or process refunds, please use the{' '}
                  <a 
                    href="https://onebooking-dashboard.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#1a237e] font-medium hover:underline"
                  >
                    OneBooking Dashboard
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Refund History */}
          {refundHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                Refund History
              </h2>
              <div className="space-y-3">
                {refundHistory.map((refund) => (
                  <div key={refund.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{formatCurrency(refund.amount)}</p>
                      <p className="text-xs text-slate-500">{refund.reason || 'No reason specified'}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(refund.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                  <span className="text-slate-600">Total Refunded</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(totalRefunded)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                OP Notes
              </h2>
              {notesSaved && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">Internal notes for admin/staff only. Not visible to customers.</p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes, special instructions, or memos here..."
              className="w-full h-32 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] resize-none text-slate-800 placeholder:text-slate-400"
            />
            <button
              onClick={saveAdminNotes}
              disabled={savingNotes}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Notes
            </button>
          </div>

          {booking.stripe_payment_intent_id && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Payment</h2>
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Payment Intent</p>
                <p className="text-xs font-mono text-slate-600 break-all">{booking.stripe_payment_intent_id}</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
