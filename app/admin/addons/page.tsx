'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Music,
  Flame,
  Heart,
  Gift,
  Car
} from 'lucide-react';
import { allAddons, type Addon } from '@/lib/data/addons';

async function adminGet(url: string) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

async function adminPost(url: string, data: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update');
  return res.json();
}

const iconMap: Record<string, React.ElementType> = {
  'violin-dinner': Music,
  'saxophone-dinner': Music,
  'spark-fountain': Flame,
  'honeymoon-anniversary': Heart,
  'birthday-mini': Gift,
  'private-transfer': Car,
};

export default function AddonsPage() {
  const [disabledAddons, setDisabledAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalDisabled, setOriginalDisabled] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDisabledAddons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminGet('/api/admin/addons');
      setDisabledAddons(data.disabledAddons || []);
      setOriginalDisabled(data.disabledAddons || []);
    } catch (error) {
      console.error('Error fetching disabled addons:', error);
      setNotification({ type: 'error', message: 'Failed to load add-ons settings' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisabledAddons();
  }, [fetchDisabledAddons]);

  useEffect(() => {
    const changed = JSON.stringify(disabledAddons.sort()) !== JSON.stringify(originalDisabled.sort());
    setHasChanges(changed);
  }, [disabledAddons, originalDisabled]);

  const toggleAddon = (addonId: string) => {
    setDisabledAddons(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      await adminPost('/api/admin/addons', { disabledAddons });
      setOriginalDisabled([...disabledAddons]);
      setHasChanges(false);
      setNotification({ type: 'success', message: 'Add-ons settings saved successfully' });
    } catch (error) {
      console.error('Error saving:', error);
      setNotification({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setDisabledAddons([...originalDisabled]);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const enabledCount = allAddons.length - disabledAddons.length;
  const disabledCount = disabledAddons.length;

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
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Add-ons Management</h1>
              <p className="text-slate-500 text-sm">Enable or disable add-ons for the booking page</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{enabledCount}</div>
            <div className="text-slate-500 text-sm">Enabled Add-ons</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{disabledCount}</div>
            <div className="text-slate-500 text-sm">Disabled Add-ons</div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800 text-sm">You have unsaved changes. Click "Save Changes" to apply them.</span>
        </div>
      )}

      {/* Add-ons List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">All Add-ons</h2>
          <p className="text-slate-500 text-sm">Toggle to enable or disable each add-on on the booking page</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-500">Loading add-ons...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {allAddons.map((addon) => {
              const isEnabled = !disabledAddons.includes(addon.id);
              const Icon = iconMap[addon.id] || Package;
              
              return (
                <motion.div
                  key={addon.id}
                  layout
                  className={`p-4 flex items-center gap-4 transition-colors ${
                    isEnabled ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={addon.image}
                      alt={addon.name}
                      fill
                      className={`object-cover transition-all ${!isEnabled ? 'grayscale opacity-50' : ''}`}
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isEnabled ? 'text-purple-600' : 'text-slate-400'}`} />
                      <h3 className={`font-semibold truncate ${isEnabled ? 'text-slate-800' : 'text-slate-400'}`}>
                        {addon.name}
                      </h3>
                    </div>
                    <p className={`text-sm line-clamp-2 ${isEnabled ? 'text-slate-500' : 'text-slate-400'}`}>
                      {addon.description}
                    </p>
                    <div className="mt-1">
                      <span className={`font-bold ${isEnabled ? 'text-purple-600' : 'text-slate-400'}`}>
                        ฿{addon.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isEnabled 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex-shrink-0 w-14 h-8 rounded-full transition-colors relative ${
                      isEnabled ? 'bg-purple-600' : 'bg-slate-300'
                    }`}
                  >
                    <motion.div
                      layout
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                      style={{ left: isEnabled ? 'calc(100% - 28px)' : '4px' }}
                    />
                    {isEnabled ? (
                      <ToggleRight className="w-5 h-5 text-white absolute right-1.5 top-1.5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-500 absolute left-1.5 top-1.5" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
