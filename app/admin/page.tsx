'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Users, 
  Clock,
  ChevronRight,
  Loader2,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { adminGet } from '@/lib/auth/api-client';
interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  totalGuests: number;
  monthGuests: number;
  pendingBookings: number;
  monthPendingBookings: number;
}

interface RecentBooking {
  id: string;
  booking_ref: string;
  activity_date: string;
  time_slot: string;
  guest_count: number;
  total_amount: number;
  status: string;
  packages: { name: string };
  booking_customers: { first_name: string; last_name: string; email: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    weekBookings: 0,
    monthBookings: 0,
    totalGuests: 0,
    monthGuests: 0,
    pendingBookings: 0,
    monthPendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminGet('/api/admin/dashboard');
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setStats(result.stats);
      setRecentBookings(result.recentBookings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#b1b94c]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here&apos;s what&apos;s happening at Three Monkeys today.</p>
      </div>

      {/* Stats Cards - All in one compact row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {/* Today's Reservations */}
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#b1b94c]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#b1b94c]/20 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-[#8a9139]" />
            </div>
            <span className="text-[10px] font-medium text-[#8a9139] bg-[#b1b94c]/10 px-1.5 py-0.5 rounded-full">
              Today
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.todayBookings}</p>
          <p className="text-xs text-slate-500">Reservations</p>
        </div>

        {/* This Week's Reservations */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#b1b94c]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#8a9139]" />
            </div>
            <span className="text-[10px] font-medium text-[#8a9139] bg-[#b1b94c]/10 px-1.5 py-0.5 rounded-full">
              Week
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.weekBookings}</p>
          <p className="text-xs text-slate-500">Reservations</p>
        </div>

        {/* This Month's Reservations */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#b1b94c]/15 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#8a9139]" />
            </div>
            <span className="text-[10px] font-medium text-[#8a9139] bg-[#b1b94c]/10 px-1.5 py-0.5 rounded-full">
              Month
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.monthBookings}</p>
          <p className="text-xs text-slate-500">Reservations</p>
        </div>

        {/* Total Guests */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.totalGuests}</p>
          <p className="text-xs text-slate-500">Guests</p>
        </div>

        {/* Guests This Month */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">
              Month
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.monthGuests}</p>
          <p className="text-xs text-slate-500">Guests</p>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
              All
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.pendingBookings}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>

        {/* Pending This Month */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
              Month
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.monthPendingBookings}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Recent Bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-[#8a9139] hover:text-[#b1b94c] hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No bookings yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((booking) => {
                  const customer = booking.booking_customers?.[0];
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-sm font-medium text-[#8a9139] hover:text-[#b1b94c] hover:underline"
                        >
                          {booking.booking_ref}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {customer ? `${customer.first_name} ${customer.last_name}` : 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">{customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-800">{booking.packages?.name}</p>
                        <p className="text-xs text-slate-500">{booking.guest_count} guest(s)</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-800">
                          {new Date(booking.activity_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {booking.time_slot === 'flexible' ? '8AM-6PM (Flex)' : booking.time_slot}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-800">
                          {formatCurrency(booking.total_amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
