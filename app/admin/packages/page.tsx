'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarX,
  Plus,
  X,
  RotateCcw,
  Info,
  Armchair,
} from 'lucide-react';
import { packages } from '@/lib/data/packages';
import {
  EMPTY_PACKAGE_CONTROLS,
  normalizePackageControls,
  type PackageControls,
} from '@/lib/data/package-controls';
import type { Package } from '@/types';
import { adminGet as fetchGet, adminPost as fetchPost } from '@/lib/auth/api-client';

const specialPackages = packages.filter(pkg => pkg.type === 'special' && !pkg.suspended);
const seatPackages = packages.filter(pkg => pkg.type === 'seat' && !pkg.suspended);

const isPerTablePkg = (id: string) => id === 'monkey-dome' || id === 'monkey-nest';

const priceUnitLabel = (pkg: Package) => {
  if (pkg.type === 'special') return 'per package (total)';
  if (isPerTablePkg(pkg.id)) return 'per table';
  return 'per person (deposit)';
};

function cloneControls(c: PackageControls): PackageControls {
  return {
    disabledPackages: [...c.disabledPackages],
    blockedDates: Object.fromEntries(Object.entries(c.blockedDates).map(([k, v]) => [k, [...v]])),
    priceOverrides: { ...c.priceOverrides },
  };
}

export default function PackagesControlPage() {
  const [controls, setControls] = useState<PackageControls>(EMPTY_PACKAGE_CONTROLS);
  const [original, setOriginal] = useState<PackageControls>(EMPTY_PACKAGE_CONTROLS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Local text drafts so the price input doesn't fight the user while typing.
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [dateDrafts, setDateDrafts] = useState<Record<string, string>>({});

  const fetchControls = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchGet('/api/admin/package-controls');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      const normalized = normalizePackageControls(data.controls);
      setControls(cloneControls(normalized));
      setOriginal(cloneControls(normalized));
    } catch (error: any) {
      console.error('Error fetching package controls:', error);
      setNotification({ type: 'error', message: error.message || 'Failed to load settings from database.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchControls();
  }, [fetchControls]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const hasChanges = useMemo(
    () => JSON.stringify(controls) !== JSON.stringify(original),
    [controls, original]
  );

  const saveChanges = async () => {
    try {
      setSaving(true);
      const res = await fetchPost('/api/admin/package-controls', { controls });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || 'Failed to save');
      const normalized = normalizePackageControls(data.controls);
      setControls(cloneControls(normalized));
      setOriginal(cloneControls(normalized));
      setPriceDrafts({});
      setNotification({ type: 'success', message: 'Package settings saved successfully' });
    } catch (error: any) {
      console.error('Error saving:', error);
      setNotification({ type: 'error', message: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setControls(cloneControls(original));
    setPriceDrafts({});
    setDateDrafts({});
  };

  const toggleEnabled = (pkgId: string) => {
    setControls(prev => ({
      ...prev,
      disabledPackages: prev.disabledPackages.includes(pkgId)
        ? prev.disabledPackages.filter(id => id !== pkgId)
        : [...prev.disabledPackages, pkgId],
    }));
  };

  const setPrice = (pkg: Package, raw: string) => {
    setPriceDrafts(prev => ({ ...prev, [pkg.id]: raw }));
    const n = parseInt(raw.replace(/[^\d]/g, ''), 10);
    setControls(prev => {
      const priceOverrides = { ...prev.priceOverrides };
      if (Number.isFinite(n) && n > 0 && n !== pkg.price) {
        priceOverrides[pkg.id] = n;
      } else {
        delete priceOverrides[pkg.id];
      }
      return { ...prev, priceOverrides };
    });
  };

  const resetPrice = (pkg: Package) => {
    setPriceDrafts(prev => ({ ...prev, [pkg.id]: String(pkg.price) }));
    setControls(prev => {
      const priceOverrides = { ...prev.priceOverrides };
      delete priceOverrides[pkg.id];
      return { ...prev, priceOverrides };
    });
  };

  const addBlockedDate = (pkgId: string) => {
    const date = dateDrafts[pkgId];
    if (!date) return;
    setControls(prev => {
      const existing = prev.blockedDates[pkgId] || [];
      if (existing.includes(date)) return prev;
      return {
        ...prev,
        blockedDates: { ...prev.blockedDates, [pkgId]: [...existing, date].sort() },
      };
    });
    setDateDrafts(prev => ({ ...prev, [pkgId]: '' }));
  };

  const removeBlockedDate = (pkgId: string, date: string) => {
    setControls(prev => {
      const remaining = (prev.blockedDates[pkgId] || []).filter(d => d !== date);
      const blockedDates = { ...prev.blockedDates };
      if (remaining.length > 0) {
        blockedDates[pkgId] = remaining;
      } else {
        delete blockedDates[pkgId];
      }
      return { ...prev, blockedDates };
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const renderPackageCard = (pkg: Package, accent: 'amber' | 'green') => {
    const isEnabled = !controls.disabledPackages.includes(pkg.id);
    const override = controls.priceOverrides[pkg.id];
    const hasOverride = override !== undefined;
    const effectivePrice = hasOverride ? override : pkg.price;
    const priceValue = priceDrafts[pkg.id] !== undefined ? priceDrafts[pkg.id] : String(effectivePrice);
    const blocked = controls.blockedDates[pkg.id] || [];
    const accentText = accent === 'amber' ? 'text-amber-600' : 'text-green-600';

    return (
      <div key={pkg.id} className={`p-4 sm:p-5 transition-colors ${isEnabled ? 'bg-white' : 'bg-slate-50'}`}>
        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
          {/* Image + info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={pkg.image}
                alt={pkg.name}
                fill
                className={`object-cover transition-all ${!isEnabled ? 'grayscale opacity-50' : ''}`}
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <h3 className={`font-semibold ${isEnabled ? 'text-slate-800' : 'text-slate-400'}`}>
                {pkg.name}
              </h3>
              <p className={`text-sm line-clamp-1 ${isEnabled ? 'text-slate-500' : 'text-slate-400'}`}>
                {pkg.shortDescription}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`font-bold ${isEnabled ? accentText : 'text-slate-400'}`}>
                  ฿{effectivePrice.toLocaleString()}
                </span>
                <span className="text-slate-400 text-xs">{priceUnitLabel(pkg)}</span>
                {hasOverride && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded-full">
                    Custom price — default ฿{pkg.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:items-end xl:items-center flex-shrink-0">
            {/* Price editor */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={priceValue}
                  onChange={(e) => setPrice(pkg, e.target.value)}
                  onBlur={() => setPriceDrafts(prev => {
                    const next = { ...prev };
                    delete next[pkg.id];
                    return next;
                  })}
                  className="w-32 pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  aria-label={`Price for ${pkg.name}`}
                />
              </div>
              {hasOverride && (
                <button
                  onClick={() => resetPrice(pkg)}
                  title={`Reset to default ฿${pkg.price.toLocaleString()}`}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status + toggle */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {isEnabled ? 'Available' : 'Disabled'}
              </div>
              <button
                onClick={() => toggleEnabled(pkg.id)}
                role="switch"
                aria-checked={isEnabled}
                aria-label={`Toggle availability of ${pkg.name}`}
                className={`flex-shrink-0 w-14 h-8 rounded-full transition-colors relative ${
                  isEnabled ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <motion.div
                  layout
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                  style={{ left: isEnabled ? 'calc(100% - 28px)' : '4px' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Blocked dates */}
        <div className="mt-4 pl-0 lg:pl-24">
          <div className="flex items-center gap-2 mb-2">
            <CalendarX className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Blocked dates {blocked.length > 0 && `(${blocked.length})`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {blocked.map(date => {
              const isPast = date < todayStr;
              return (
                <span
                  key={date}
                  className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium border ${
                    isPast
                      ? 'bg-slate-100 text-slate-400 border-slate-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {isPast && <span className="text-[9px]">(past)</span>}
                  <button
                    onClick={() => removeBlockedDate(pkg.id, date)}
                    className="p-0.5 hover:bg-red-100 rounded-full transition-colors"
                    aria-label={`Unblock ${date}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            <div className="inline-flex items-center gap-1.5">
              <input
                type="date"
                min={todayStr}
                value={dateDrafts[pkg.id] || ''}
                onChange={(e) => setDateDrafts(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                className="px-2.5 py-1 border border-slate-200 rounded-full text-xs text-slate-600 focus:outline-none focus:border-purple-400"
                aria-label={`Block a date for ${pkg.name}`}
              />
              <button
                onClick={() => addBlockedDate(pkg.id)}
                disabled={!dateDrafts[pkg.id]}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 rounded-full text-xs font-medium transition-colors"
              >
                <Plus className="w-3 h-3" />
                Block date
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Packages & Pricing</h1>
              <p className="text-slate-500 text-sm">
                Enable/disable packages, block specific dates, and manage sale prices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={resetChanges}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            )}
            <button
              onClick={saveChanges}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
                hasChanges && !saving
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Price change note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-blue-800 text-sm">
          <p className="font-medium">Price changes only apply to new bookings.</p>
          <p className="text-blue-700/80 mt-0.5">
            Bookings that were already paid keep the price the customer paid at the time of purchase —
            changing a price here never modifies existing orders.
          </p>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800 text-sm">
            You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
          </span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading packages...</p>
        </div>
      ) : (
        <>
          {/* Special Packages */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <h2 className="font-semibold text-slate-800">Special Packages</h2>
                <p className="text-slate-500 text-sm">
                  Ultimate Dinner, Birthday, Proposal... — toggle availability, block dates, or change the package price
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {specialPackages.map(pkg => renderPackageCard(pkg, 'amber'))}
            </div>
          </div>

          {/* Dining Seats */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Armchair className="w-4 h-4 text-green-600" />
              <div>
                <h2 className="font-semibold text-slate-800">Dining Seats</h2>
                <p className="text-slate-500 text-sm">
                  Seat zones — prices are the per-person deposit (or per-table for Monkey Dome / Monkey Nest)
                </p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {seatPackages.map(pkg => renderPackageCard(pkg, 'green'))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
