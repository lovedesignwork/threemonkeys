'use client';

import { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  Percent,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/auth/api-client';
import { CustomSelect } from '@/components/ui';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  stripe_coupon_id: string | null;
  created_at: string;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const response = await adminGet('/api/admin/promo-codes');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPromoCodes(result.data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const startEdit = (promo: PromoCode) => {
    setEditingId(promo.id);
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      min_order_amount: promo.min_order_amount,
      max_uses: promo.max_uses?.toString() || '',
      valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : '',
      valid_until: promo.valid_until ? promo.valid_until.split('T')[0] : '',
      is_active: promo.is_active,
    });
    setShowAddForm(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount_value) return;
    setSaving(true);

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        ...(editingId && { id: editingId }),
      };

      const response = editingId 
        ? await adminPut('/api/admin/promo-codes', payload)
        : await adminPost('/api/admin/promo-codes', payload);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      await fetchPromoCodes();
      resetForm();
    } catch (error) {
      console.error('Error saving promo code:', error);
      alert('Failed to save promo code');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const response = await adminDelete(`/api/admin/promo-codes?id=${id}`);

      if (!response.ok) throw new Error('Failed to delete');
      setPromoCodes(promoCodes.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting promo code:', error);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    try {
      const response = await adminPut('/api/admin/promo-codes', { id: promo.id, is_active: !promo.is_active });

      if (!response.ok) throw new Error('Failed to toggle');
      setPromoCodes(promoCodes.map((p) => 
        p.id === promo.id ? { ...p, is_active: !p.is_active } : p
      ));
    } catch (error) {
      console.error('Error toggling promo code:', error);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (promo: PromoCode) => {
    if (!promo.is_active) {
      return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">Inactive</span>;
    }
    
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Scheduled</span>;
    }
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">Expired</span>;
    }
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">Limit Reached</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Promo Codes</h1>
          <p className="text-slate-500">Manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-xl hover:bg-[#0d1259] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Promo Code
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Edit Promo Code' : 'Add New Promo Code'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER20"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 uppercase placeholder:normal-case placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
              <CustomSelect
                value={formData.discount_type}
                onChange={(value) => setFormData({ ...formData, discount_type: value as 'percentage' | 'fixed' })}
                options={[
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'fixed', label: 'Fixed Amount (THB)' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Discount Value *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.discount_type === 'percentage' ? '20' : '500'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {formData.discount_type === 'percentage' ? '%' : '฿'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summer sale discount"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Order (THB)</label>
              <input
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses</label>
              <input
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid From</label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.code || !formData.discount_value}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {editingId ? 'Update' : 'Create'} Promo Code
            </button>
          </div>
        </div>
      )}

      {promoCodes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No promo codes yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 text-[#1a237e] hover:underline"
          >
            Create your first promo code
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Validity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promoCodes.map((promo) => (
                  <tr key={promo.id} className={`hover:bg-slate-50 ${!promo.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a237e]/10 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-[#1a237e]" />
                        </div>
                        <div>
                          <p className="font-mono font-semibold text-slate-800">{promo.code}</p>
                          {promo.description && (
                            <p className="text-xs text-slate-500">{promo.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {promo.discount_type === 'percentage' ? (
                          <>
                            <Percent className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">{promo.discount_value}%</span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-green-600">฿{promo.discount_value.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                      {promo.min_order_amount > 0 && (
                        <p className="text-xs text-slate-500">Min: ฿{promo.min_order_amount.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700">
                          {promo.current_uses}{promo.max_uses ? ` / ${promo.max_uses}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDate(promo.valid_from)} - {formatDate(promo.valid_until)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(promo)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(promo)}
                          className={`p-2 rounded-lg transition-colors ${
                            promo.is_active 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={promo.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(promo)}
                          className="p-2 text-slate-400 hover:text-[#1a237e] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
