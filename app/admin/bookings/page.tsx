'use client';

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
  StickyNote
} from 'lucide-react';
import { adminGet, adminFetch } from '@/lib/auth/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { CustomSelect } from '@/components/ui';

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
  packages: { name: string };
  promo_codes?: { code: string; discount_type: string; discount_value: number } | null;
  booking_customers: { first_name: string; last_name: string; email: string; phone: string; special_requests?: string | null }[];
  booking_transport: { id?: string; transport_type: string; hotel_name: string | null; room_number: string | null; private_passengers: number | null; additional_guests: number | null }[];
  booking_addons: { quantity: number; promo_addons: { name: string } }[];
}

type SortField = 'booking_ref' | 'activity_date' | 'guest_count' | 'total_amount' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'cancelled', 'completed', 'refunded'];

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
    // Wait for auth to be ready before fetching
    if (!authLoading) {
      fetchBookings();
    }
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
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    }
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
      transport?.hotel_name?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTransportLabel = (type: string) => {
    switch (type) {
      case 'hotel_pickup':
        return { label: 'Hotel Pickup', icon: Hotel, color: 'text-blue-600 bg-blue-50' };
      case 'private':
        return { label: 'Private', icon: Car, color: 'text-purple-600 bg-purple-50' };
      case 'self_arrange':
        return { label: 'Self Transfer', icon: MapPin, color: 'text-slate-600 bg-slate-50' };
      default:
        return { label: type, icon: MapPin, color: 'text-slate-600 bg-slate-50' };
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        dateType: dateFilterType,
        dateFrom,
        dateTo,
      });

      const response = await adminGet(`/api/admin/bookings/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

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
    if (!confirm('Manual backup sync: This will sync 1 confirmed booking that may not have been synced automatically. New bookings are now synced automatically via database trigger. Continue?')) {
      return;
    }
    
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
        setSyncResult({ 
          type: 'success', 
          message: `${result.message}${hasMore ? ' - click again to sync more' : ''}` 
        });
      } else {
        setSyncResult({ 
          type: 'error', 
          message: result.error || 'Sync failed' 
        });
      }
    } catch (error) {
      console.error('Bulk sync error:', error);
      setSyncResult({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Sync failed' 
      });
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
            {bulkSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
            {bulkSyncing ? 'Syncing...' : 'Manual Sync'}
          </button>
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-xl hover:bg-[#0d1259] transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
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
            href="https://onebooking-dashboard.vercel.app/bookings" 
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
                  placeholder="Search by reference, name, email, or hotel..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-500"
                />
              </div>
              <CustomSelect
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
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
              
              {/* Date Type Toggle */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => {
                    setDateFilterType('booking');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    dateFilterType === 'booking'
                      ? 'bg-[#1a237e] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Booking Date
                </button>
                <button
                  onClick={() => {
                    setDateFilterType('play');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    dateFilterType === 'play'
                      ? 'bg-[#1a237e] text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Play Date
                </button>
              </div>
              
              {/* Date Range Inputs */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 text-sm"
                  />
                </div>
              </div>
              
              {/* Clear Filter Button */}
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setPage(1);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
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
          <div className="p-8 text-center text-slate-500">
            No bookings found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('booking_ref')}
                    >
                      <div className="flex items-center gap-1">
                        Booking Ref
                        <SortIcon field="booking_ref" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        Booked On
                        <SortIcon field="created_at" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('activity_date')}
                    >
                      <div className="flex items-center gap-1">
                        Play Date
                        <SortIcon field="activity_date" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('guest_count')}
                    >
                      <div className="flex items-center gap-1">
                        Guests
                        <SortIcon field="guest_count" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Additional
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Transport
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Hotel / Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Add-ons
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('total_amount')}
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        <SortIcon field="total_amount" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => {
                    const customer = booking.booking_customers?.[0];
                    const transport = booking.booking_transport?.[0];
                    const addons = booking.booking_addons || [];
                    const transportInfo = transport ? getTransportLabel(transport.transport_type) : null;
                    const TransportIcon = transportInfo?.icon || MapPin;

                    return (
                      <tr key={booking.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-[#1a237e]">
                            {booking.booking_ref}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm text-slate-800">
                            {new Date(booking.created_at).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: 'numeric',
                              timeZone: 'Asia/Bangkok'
                            })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(booking.created_at).toLocaleTimeString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              timeZone: 'Asia/Bangkok'
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {customer ? `${customer.first_name} ${customer.last_name}` : 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500">{customer?.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm text-slate-800">{booking.packages?.name}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm text-slate-800">
                            {new Date(booking.activity_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.time_slot === 'flexible' ? '8AM-6PM (Flex)' : booking.time_slot}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <p className="text-sm text-slate-800">{booking.guest_count}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {transport?.additional_guests && transport.additional_guests > 0 ? (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                              {transport.additional_guests}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {transportInfo && (
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${transportInfo.color}`}>
                                <TransportIcon className="w-3 h-3" />
                                {transportInfo.label}
                              </span>
                              {transport?.transport_type === 'private' && transport.private_passengers ? (
                                <span className="text-xs text-purple-600 font-medium">
                                  {transport.private_passengers} pax
                                </span>
                              ) : transport?.transport_type === 'hotel_pickup' && (
                                <span className="text-xs text-slate-600">
                                  Pickup: {booking.guest_count + (transport?.additional_guests || 0)} pax
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {transport?.hotel_name ? (
                            <div>
                              <p className="text-sm text-slate-800">{transport.hotel_name}</p>
                              {transport.room_number && (
                                <p className="text-xs text-slate-500">Room {transport.room_number}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {addons.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {addons.map((addon, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg"
                                >
                                  <Gift className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate max-w-[150px]">
                                    {addon.quantity}x {addon.promo_addons?.name || 'Add-on'}
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {formatCurrency(booking.total_amount)}
                            </p>
                            {booking.promo_codes && booking.discount_amount && booking.discount_amount > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Tag className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-medium text-green-600">
                                  {booking.promo_codes.code}
                                </span>
                                <span className="text-xs text-green-500">
                                  ({booking.promo_codes.discount_type === 'percentage' 
                                    ? `${booking.promo_codes.discount_value}% OFF`
                                    : `-฿${booking.promo_codes.discount_value}`
                                  })
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {customer?.special_requests ? (
                            <div className="flex items-start gap-1.5 max-w-[180px]" title={customer.special_requests}>
                              <StickyNote className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {customer.special_requests}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            href={`/admin/bookings/${booking.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#1a237e] hover:bg-[#1a237e]/10 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
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
                    onChange={(value) => {
                      setPageSize(Number(value));
                      setPage(1);
                    }}
                    options={PAGE_SIZE_OPTIONS.map((size) => ({
                      value: String(size),
                      label: String(size),
                    }))}
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
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages || 1}
                </span>
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
