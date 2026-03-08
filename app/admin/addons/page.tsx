'use client';

import { useEffect, useState } from 'react';
import { 
  Gift, 
  Plus, 
  Pencil, 
  Loader2,
  Check,
  X,
  Tag,
  Percent
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { adminGet, adminPost, adminPut, adminPatch } from '@/lib/auth/api-client';

interface AddonData {
  id: string;
  name: string;
  price: number;
  original_price: number;
  description: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  image_url: string | null;
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<AddonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AddonData>>({});
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddon, setNewAddon] = useState<Partial<AddonData>>({
    name: '',
    price: 0,
    original_price: 0,
    description: '',
    is_active: true,
    image_url: null,
  });

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const response = await adminGet('/api/admin/addons');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAddons(result.data || []);
    } catch (error) {
      console.error('Error fetching addons:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (addon: AddonData) => {
    setEditingId(addon.id);
    setEditForm({ ...addon });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const response = await adminPut('/api/admin/addons', {
          id: editingId,
          name: editForm.name,
          price: editForm.price,
          original_price: editForm.original_price,
          description: editForm.description,
          is_active: editForm.is_active,
          image_url: editForm.image_url,
        });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setAddons((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...editForm } : a))
      );
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating addon:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (addon: AddonData) => {
    try {
      const response = await adminPatch('/api/admin/addons', { id: addon.id, is_active: !addon.is_active });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setAddons((prev) =>
        prev.map((a) => (a.id === addon.id ? { ...a, is_active: !a.is_active } : a))
      );
    } catch (error) {
      console.error('Error toggling addon:', error);
    }
  };

  const addNewAddon = async () => {
    if (!newAddon.name || !newAddon.price) return;
    setSaving(true);
    try {
      const id = newAddon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const response = await adminPost('/api/admin/addons', {
          id,
          name: newAddon.name,
          price: newAddon.price,
          original_price: newAddon.original_price || newAddon.price,
          description: newAddon.description || null,
          is_active: true,
          image_url: newAddon.image_url || null,
        });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      await fetchAddons();
      setShowAddForm(false);
      setNewAddon({
        name: '',
        price: 0,
        original_price: 0,
        description: '',
        is_active: true,
        image_url: null,
      });
    } catch (error) {
      console.error('Error adding addon:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDiscountPercent = (price: number, originalPrice: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
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
          <h1 className="text-2xl font-bold text-slate-800">Add-ons / Upsells</h1>
          <p className="text-slate-500">Manage promotional add-ons for bookings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-xl hover:bg-[#0d1259] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Add-on
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Add-on</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={newAddon.name}
                onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                placeholder="Wine Pairing"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price (THB) *</label>
              <input
                type="number"
                value={newAddon.price}
                onChange={(e) => setNewAddon({ ...newAddon, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                placeholder="770"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Original Price (THB)</label>
              <input
                type="number"
                value={newAddon.original_price}
                onChange={(e) => setNewAddon({ ...newAddon, original_price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                placeholder="856"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={newAddon.description || ''}
                onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                placeholder="Professional photography service"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Add-on Image</label>
              <ImageUploader
                bucket="product-images"
                folder="addons"
                currentImageUrl={newAddon.image_url}
                onUpload={(url) => setNewAddon({ ...newAddon, image_url: url })}
                onRemove={() => setNewAddon({ ...newAddon, image_url: null })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={addNewAddon}
              disabled={saving || !newAddon.name || !newAddon.price}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Add-on
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className={`bg-white rounded-2xl shadow-sm overflow-hidden ${!addon.is_active ? 'opacity-50' : ''}`}
          >
            {editingId === addon.id ? (
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Sale Price</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Original Price</label>
                      <input
                        type="number"
                        value={editForm.original_price}
                        onChange={(e) => setEditForm({ ...editForm, original_price: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg resize-none text-slate-800"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-orange-600" />
                    </div>
                    <button
                      onClick={() => startEdit(addon)}
                      className="p-2 text-slate-400 hover:text-[#1a237e] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{addon.name}</h3>
                  
                  {addon.description && (
                    <p className="text-sm text-slate-500 mb-4">{addon.description}</p>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-bold text-slate-800">฿{addon.price.toLocaleString()}</span>
                    {addon.original_price > addon.price && (
                      <>
                        <span className="text-sm text-slate-400 line-through">
                          ฿{addon.original_price.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          <Percent className="w-3 h-3" />
                          {getDiscountPercent(addon.price, addon.original_price)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {addon.id}
                    </span>
                    <button
                      onClick={() => toggleActive(addon)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        addon.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {addon.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {addon.stripe_product_id && (
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                      Stripe: {addon.stripe_product_id.slice(0, 20)}...
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
