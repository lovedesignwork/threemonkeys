'use client';

/**
 * /admin/bookings — Bookings list (Baboon-style compact layout, 3M-specific)
 *
 * Columns:
 *   Ref · Booked · Customer (+ country flag) · Reservation · Time · Guests ·
 *   Zone / Table · Add-ons · Deposit · Notes · Origin · Status / Action
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Hotel,
  Car,
  MapPin,
  Gift,
  Calendar,
  Tag,
  Cloud,
  RefreshCw,
  ExternalLink,
  Info,
  X,
  StickyNote,
  Clock,
  Users,
  Globe,
  CreditCard,
  Copy,
  Check,
  Link2,
} from 'lucide-react';
import { adminGet, adminFetch } from '@/lib/auth/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { CustomSelect } from '@/components/ui';
import ReactCountryFlag from 'react-country-flag';

function CountryFlag({ countryCode, size = 'md', title }: { countryCode: string | null | undefined; size?: 'sm' | 'md' | 'lg'; title?: string }) {
  const sizeMap = { sm: '1em', md: '1.2em', lg: '1.5em' };
  if (!countryCode || countryCode.length !== 2 || countryCode.toUpperCase() === 'XX') {
    return <span className="text-slate-300">🏳️</span>;
  }
  return (
    <ReactCountryFlag
      countryCode={countryCode.toUpperCase()}
      svg
      style={{ width: sizeMap[size], height: sizeMap[size] }}
      title={title ?? countryCode.toUpperCase()}
    />
  );
}

interface Booking {
  id: string;
  booking_ref: string;
  activity_date: string;
  time_slot: string;
  guest_count: number;
  total_amount: number;
  discount_amount?: number;
  status: string;
  created_at: string;
  admin_notes?: string | null;
  zone_id?: string | null;
  table_code?: string | null;
  packages: { name: string };
  promo_codes?: { code: string; discount_type: string; discount_value: number } | null;
  booking_customers: { first_name: string; last_name: string; email: string; phone: string; country_code?: string | null; special_requests?: string | null }[];
  booking_transport: { id?: string; transport_type: string; hotel_name: string | null; room_number: string | null; private_passengers: number | null; non_players?: number | null }[];
  booking_addons: { quantity: number; unit_price?: number; promo_addons: { name: string } }[];
  booking_origin_ip?: string | null;
  booking_origin_country_code?: string | null;
  booking_origin_country_name?: string | null;
  payment_origin_country_code?: string | null;
  payment_origin_country_name?: string | null;
  // Manual booking markers (set for rows sourced from tm_allotments)
  is_manual?: boolean;
  source?: string | null;
  adult_count?: number | null;
  child_count?: number | null;
  public_token?: string | null;
  reservation_seq?: string | null;
}

// Friendly label + emoji for manual booking sources.
const SOURCE_LABELS: Record<string, string> = {
  live_chat: '💬 Live Chat',
  phone: '📞 Phone',
  email: '📧 Email',
  walk_in: '🚶 Walk-in',
  admin: '🔧 Admin',
  other: '❓ Other',
  website: '🌐 Website',
};
const sourceLabel = (s: string | null | undefined) =>
  s ? (SOURCE_LABELS[s] ?? s) : 'Manual';

type SortField = 'booking_ref' | 'activity_date' | 'guest_count' | 'total_amount' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'cancelled', 'completed', 'refunded'];

// Friendly display name for zone_id. Falls back to the id if unknown.
const ZONE_NAMES: Record<string, string> = {
  'monkey-dome':           'Monkey Dome',
  'monkey-nest':           'Monkey Nest',
  'monkey-hilltop':        'Monkey Hilltop',
  'bamboo-pavilion':       'Bamboo Pavilion',
  'zone-t':                'Zone T',
  'zone-z':                'Zone Z',
  'exclusive-romantic':    'Exclusive Romantic',
  'romantic-rooftop-luge': 'Romantic Rooftop',
};
const zoneName = (id: string | null | undefined) => (id ? ZONE_NAMES[id] ?? id : null);

// Public site base for the customer e-ticket link. Falls back to the
// production domain, then to the current admin origin.
function reservationBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.hostname.includes('threemonkeys')) {
    return window.location.origin;
  }
  return 'https://threemonkeysphuket.com';
}

// "Copy ticket link" button shown for manual bookings. Copies the unique,
// unguessable reservation URL to the clipboard and gives quick visual feedback.
function CopyLinkButton({ token, seq }: { token: string; seq: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${reservationBaseUrl()}/reservation/${token}${seq ? `/${seq}` : ''}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={copy}
        title={`Copy ticket link\n${url}`}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
          copied
            ? 'bg-green-100 text-green-700'
            : 'bg-[#1a237e]/10 text-[#1a237e] hover:bg-[#1a237e]/20'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Open ticket in new tab"
        className="p-1.5 text-slate-400 hover:text-[#1a237e] hover:bg-[#1a237e]/10 rounded-lg transition-colors"
      >
        <Link2 className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

export default function BookingsPage() {
  const { loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilterType, setDateFilterType] = useState<'booking' | 'play'>('play');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
  const [pageSize, setPageSize] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, page, pageSize, statusFilter, dateFilterType, dateFrom, dateTo, sortField, sortDirection]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        status: statusFilter,
        sortField,
        sortDirection,
        dateFilterType,
        dateFrom,
        dateTo,
      });
      const response = await adminGet(`/api/admin/bookings?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setBookings(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 text-[#1a237e]" />
      : <ArrowDown className="w-3 h-3 text-[#1a237e]" />;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const customer = booking.booking_customers?.[0];
    const transport = booking.booking_transport?.[0];
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.booking_ref.toLowerCase().includes(searchLower) ||
      customer?.email?.toLowerCase().includes(searchLower) ||
      customer?.first_name?.toLowerCase().includes(searchLower) ||
      customer?.last_name?.toLowerCase().includes(searchLower) ||
      transport?.hotel_name?.toLowerCase().includes(searchLower) ||
      booking.table_code?.toLowerCase().includes(searchLower) ||
      zoneName(booking.zone_id)?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency', currency: 'THB', minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending':   return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'refunded':  return 'bg-purple-100 text-purple-800';
      default:          return 'bg-slate-100 text-slate-800';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, dateType: dateFilterType, dateFrom, dateTo });
      const response = await adminGet(`/api/admin/bookings/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export bookings');
    } finally {
      setExporting(false);
    }
  };

  const handleBulkSyncToOneBooking = async () => {
    if (!confirm('Manual backup sync: This will sync confirmed bookings that may not have been synced automatically. New bookings are now synced automatically. Continue?')) return;
    setBulkSyncing(true);
    setSyncResult(null);
    try {
      const response = await adminFetch('/api/admin/bookings/bulk-sync-onebooking', {
        method: 'POST',
        body: JSON.stringify({ syncAll: true }),
      });
      const result = await response.json();
      if (result.success) {
        const hasMore = result.results?.total === 1;
        setSyncResult({ type: 'success', message: `${result.message}${hasMore ? ' - click again to sync more' : ''}` });
      } else {
        setSyncResult({ type: 'error', message: result.error || 'Sync failed' });
      }
    } catch (error) {
      console.error('Bulk sync error:', error);
      setSyncResult({ type: 'error', message: error instanceof Error ? error.message : 'Sync failed' });
    } finally {
      setBulkSyncing(false);
      setTimeout(() => setSyncResult(null), 10000);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bookings</h1>
          <p className="text-slate-500">View all booking records (read-only)</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBulkSyncToOneBooking}
            disabled={bulkSyncing}
            className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {bulkSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
            {bulkSyncing ? 'Syncing...' : 'Manual Sync'}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-xl hover:bg-[#0d1259] transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* View-Only Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-800">
            <span className="font-medium">This page is view-only.</span> New confirmed bookings are automatically synced to OneBooking Dashboard. To edit bookings (status, hotel, etc.), please use OneBooking Dashboard.
          </p>
          <a
            href="https://db.onebooking.co/bookings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
          >
            Open OneBooking Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {syncResult && (
        <div className={`mb-4 p-4 rounded-xl ${
          syncResult.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {syncResult.message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search and Status */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ref, name, email, hotel, zone, table…"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-500"
                />
              </div>
              <CustomSelect
                value={statusFilter}
                onChange={(value) => { setStatusFilter(value); setPage(1); }}
                options={STATUS_OPTIONS.map((status) => ({
                  value: status,
                  label: status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1),
                }))}
                className="w-40"
              />
            </div>

            {/* Row 2: Date Range Filter */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Filter by:</span>
              </div>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => { setDateFilterType('booking'); setPage(1); }}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${dateFilterType === 'booking' ? 'bg-[#1a237e] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >Booking Date</button>
                <button
                  onClick={() => { setDateFilterType('play'); setPage(1); }}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${dateFilterType === 'play' ? 'bg-[#1a237e] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >Reservation Date</button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 text-sm"
                  />
                </div>
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No bookings found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('booking_ref')}>
                      <div className="flex items-center gap-1">Ref<SortIcon field="booking_ref" /></div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('created_at')}>
                      <div className="flex items-center gap-1">Booked<SortIcon field="created_at" /></div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('activity_date')}>
                      <div className="flex items-center gap-1">Reservation<SortIcon field="activity_date" /></div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('guest_count')}>
                      <div className="flex items-center justify-center gap-1">Guests<SortIcon field="guest_count" /></div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Zone / Table</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Add-ons</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100" onClick={() => handleSort('total_amount')}>
                      <div className="flex items-center gap-1">Deposit<SortIcon field="total_amount" /></div>
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Origin</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-28"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => {
                    const customer = booking.booking_customers?.[0];
                    const addons = booking.booking_addons || [];
                    const transport = booking.booking_transport?.[0];
                    const zone = zoneName(booking.zone_id);

                    return (
                      <tr key={booking.id} className="hover:bg-slate-50">
                        {/* Ref */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#1a237e]">{booking.booking_ref}</span>
                        </td>
                        {/* Booked */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="text-sm text-slate-800">
                            {new Date(booking.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'Asia/Bangkok' })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(booking.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })}
                          </p>
                        </td>
                        {/* Customer */}
                        <td className="px-3 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                              {customer ? `${customer.first_name} ${customer.last_name}` : 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500">{customer?.email}</p>
                            {customer?.phone && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {customer.country_code && `${customer.country_code} `}{customer.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        {/* Reservation Date */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="text-sm text-slate-800">
                            {new Date(booking.activity_date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(booking.activity_date).toLocaleDateString('en-GB', { year: 'numeric' })}
                          </p>
                        </td>
                        {/* Time */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                            <Clock className="w-3 h-3" />
                            {booking.time_slot || '-'}
                          </span>
                        </td>
                        {/* Guests */}
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
                            <Users className="w-3.5 h-3.5" />
                            {booking.guest_count}
                          </span>
                        </td>
                        {/* Zone / Table */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {zone ? (
                            <div>
                              <p className="text-sm font-medium text-slate-800">{zone}</p>
                              {booking.table_code && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded">
                                  {booking.table_code}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">{booking.packages?.name ?? '-'}</span>
                          )}
                          {transport?.transport_type === 'hotel_pickup' && transport?.hotel_name && (
                            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 truncate max-w-[140px]" title={`${transport.hotel_name}${transport.room_number ? ' · Room ' + transport.room_number : ''}`}>
                              <Hotel className="w-3 h-3 flex-shrink-0" />
                              {transport.hotel_name}
                            </p>
                          )}
                          {transport?.transport_type === 'private' && (
                            <p className="text-[10px] text-purple-600 mt-1 flex items-center gap-1">
                              <Car className="w-3 h-3" />Private transfer
                            </p>
                          )}
                        </td>
                        {/* Add-ons */}
                        <td className="px-3 py-3">
                          {addons.length > 0 ? (
                            <div className="flex flex-col gap-1 max-w-[160px]">
                              {addons.map((addon, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 rounded">
                                  <Gift className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{addon.quantity}× {addon.promo_addons?.name || 'Add-on'}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        {/* Deposit */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <p className="text-sm font-medium text-slate-800">{formatCurrency(booking.total_amount)}</p>
                          {booking.promo_codes && booking.discount_amount && booking.discount_amount > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Tag className="w-3 h-3 text-green-600" />
                              <span className="text-[10px] font-medium text-green-600">{booking.promo_codes.code}</span>
                              <span className="text-[10px] text-green-500">
                                ({booking.promo_codes.discount_type === 'percentage'
                                  ? `${booking.promo_codes.discount_value}% OFF`
                                  : `-฿${booking.promo_codes.discount_value}`})
                              </span>
                            </div>
                          )}
                        </td>
                        {/* Notes (special_requests) */}
                        <td className="px-3 py-3">
                          {customer?.special_requests ? (
                            <div className="flex items-start gap-1.5 max-w-[160px]" title={customer.special_requests}>
                              <StickyNote className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600 line-clamp-2">{customer.special_requests}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        {/* Ticket (public e-ticket copy link — manual bookings only) */}
                        <td className="px-3 py-3 whitespace-nowrap text-center">
                          {booking.is_manual && booking.public_token ? (
                            <CopyLinkButton
                              token={booking.public_token}
                              seq={booking.reservation_seq || ''}
                            />
                          ) : (
                            <span className="text-xs text-slate-300">-</span>
                          )}
                        </td>
                        {/* Origin (booking + payment) */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {booking.is_manual ? (
                            <div className="flex justify-center">
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-cyan-100 text-cyan-800 whitespace-nowrap"
                                title={`Manual booking via ${sourceLabel(booking.source)}`}
                              >
                                {sourceLabel(booking.source)}
                              </span>
                            </div>
                          ) : (
                          <div className="flex flex-col gap-0.5 items-center text-[10px] text-slate-500">
                            {booking.booking_origin_country_code && (
                              <span
                                className="flex items-center gap-1"
                                title={`Booked from: ${booking.booking_origin_country_name || booking.booking_origin_country_code}${booking.booking_origin_ip ? ' (' + booking.booking_origin_ip + ')' : ''}`}
                              >
                                <Globe className="w-3 h-3" />
                                <CountryFlag countryCode={booking.booking_origin_country_code} size="sm" />
                                <span className="uppercase">{booking.booking_origin_country_code}</span>
                              </span>
                            )}
                            {booking.payment_origin_country_code && (
                              <span
                                className="flex items-center gap-1"
                                title={`Card from: ${booking.payment_origin_country_name || booking.payment_origin_country_code}`}
                              >
                                <CreditCard className="w-3 h-3" />
                                <CountryFlag countryCode={booking.payment_origin_country_code} size="sm" />
                                <span className="uppercase">{booking.payment_origin_country_code}</span>
                              </span>
                            )}
                            {!booking.booking_origin_country_code && !booking.payment_origin_country_code && (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                          )}
                        </td>
                        {/* Status + Action */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className="p-1.5 text-[#1a237e] hover:bg-[#1a237e]/10 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-500">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} bookings
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Show:</span>
                  <CustomSelect
                    value={String(pageSize)}
                    onChange={(value) => { setPageSize(Number(value)); setPage(1); }}
                    options={PAGE_SIZE_OPTIONS.map((size) => ({ value: String(size), label: String(size) }))}
                    size="sm"
                    className="w-20"
                  />
                  <span className="text-sm text-slate-500">per page</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <span className="text-sm text-slate-600">Page {page} of {totalPages || 1}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
