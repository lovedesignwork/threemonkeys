'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Check,
  X,
  Clock,
  Utensils,
  Car
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { adminGet, adminPost, adminPut, adminPatch } from '@/lib/auth/api-client';
import { CustomSelect } from '@/components/ui';

interface PackageData {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
  includes_meal: boolean;
  includes_transfer: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  image_url: string | null;
}

const CATEGORIES = [
  { value: 'combined', label: 'Combo Package' },
  { value: 'tasting', label: 'Tasting Menu' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'skywalk', label: 'Garden Dining' },
  { value: 'afternoon', label: 'Afternoon Tea' },
  { value: 'experience', label: 'Culinary Experience' },
];

export default function ProductsPage() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PackageData>>({});
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPackage, setNewPackage] = useState<Partial<PackageData>>({
    name: '',
    price: 0,
    duration: '',
    category: 'combined',
    includes_meal: false,
    includes_transfer: false,
    is_active: true,
    image_url: null,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await adminGet('/api/admin/products');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPackages(result.data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (pkg: PackageData) => {
    setEditingId(pkg.id);
    setEditForm({ ...pkg });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const response = await adminPut('/api/admin/products', {
          id: editingId,
          name: editForm.name,
          price: editForm.price,
          duration: editForm.duration,
          category: editForm.category,
          includes_meal: editForm.includes_meal,
          includes_transfer: editForm.includes_transfer,
          is_active: editForm.is_active,
          image_url: editForm.image_url,
        });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setPackages((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...editForm } : p))
      );
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating package:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pkg: PackageData) => {
    try {
      const response = await adminPatch('/api/admin/products', { id: pkg.id, is_active: !pkg.is_active });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_active: !p.is_active } : p))
      );
    } catch (error) {
      console.error('Error toggling package:', error);
    }
  };

  const addPackage = async () => {
    if (!newPackage.name || !newPackage.price) return;
    setSaving(true);
    try {
      const id = newPackage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const response = await adminPost('/api/admin/products', {
          id,
          name: newPackage.name,
          price: newPackage.price,
          duration: newPackage.duration || 'TBD',
          category: newPackage.category || 'combined',
          includes_meal: newPackage.includes_meal || false,
          includes_transfer: newPackage.includes_transfer || false,
          is_active: true,
          image_url: newPackage.image_url || null,
        });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      await fetchPackages();
      setShowAddForm(false);
      setNewPackage({
        name: '',
        price: 0,
        duration: '',
        category: 'combined',
        includes_meal: false,
        includes_transfer: false,
        is_active: true,
      });
    } catch (error) {
      console.error('Error adding package:', error);
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

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
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
          <h1 className="text-2xl font-bold text-slate-800">Products / Packages</h1>
          <p className="text-slate-500">Manage your dining packages</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-xl hover:bg-[#0d1259] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Package</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                placeholder="WORLD A+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (THB) *</label>
              <input
                type="number"
                value={newPackage.price}
                onChange={(e) => setNewPackage({ ...newPackage, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                placeholder="3490"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={newPackage.duration}
                onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a237e] text-slate-800 placeholder:text-slate-400"
                placeholder="Up to 3 hours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <CustomSelect
                value={newPackage.category || ''}
                onChange={(value) => setNewPackage({ ...newPackage, category: value })}
                options={CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label }))}
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.includes_meal}
                  onChange={(e) => setNewPackage({ ...newPackage, includes_meal: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Includes Meal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPackage.includes_transfer}
                  onChange={(e) => setNewPackage({ ...newPackage, includes_transfer: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Includes Transfer</span>
              </label>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Package Image</label>
              <ImageUploader
                bucket="product-images"
                folder="packages"
                currentImageUrl={newPackage.image_url}
                onUpload={(url) => setNewPackage({ ...newPackage, image_url: url })}
                onRemove={() => setNewPackage({ ...newPackage, image_url: null })}
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
              onClick={addPackage}
              disabled={saving || !newPackage.name || !newPackage.price}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Package
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Package</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Includes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packages.map((pkg) => (
              <tr key={pkg.id} className={`hover:bg-slate-50 ${!pkg.is_active ? 'opacity-50' : ''}`}>
                {editingId === pkg.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-slate-800"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-slate-200 rounded text-slate-800"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.duration}
                        onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                        className="w-32 px-2 py-1 border border-slate-200 rounded text-slate-800"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <CustomSelect
                        value={editForm.category || ''}
                        onChange={(value) => setEditForm({ ...editForm, category: value })}
                        options={CATEGORIES.map((cat) => ({ value: cat.value, label: cat.label }))}
                        size="sm"
                        className="w-40"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <label className="flex items-center gap-1 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={editForm.includes_meal}
                            onChange={(e) => setEditForm({ ...editForm, includes_meal: e.target.checked })}
                          />
                          Meal
                        </label>
                        <label className="flex items-center gap-1 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={editForm.includes_transfer}
                            onChange={(e) => setEditForm({ ...editForm, includes_transfer: e.target.checked })}
                          />
                          Transfer
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CustomSelect
                        value={editForm.is_active ? 'active' : 'inactive'}
                        onChange={(value) => setEditForm({ ...editForm, is_active: value === 'active' })}
                        options={[
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' },
                        ]}
                        size="sm"
                        className="w-28"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a237e]/10 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#1a237e]" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{pkg.name}</p>
                          <p className="text-xs text-slate-400">{pkg.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-800 font-medium">
                        ฿{pkg.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {pkg.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                        {getCategoryLabel(pkg.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {pkg.includes_meal && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">
                            <Utensils className="w-3 h-3" />
                            Meal
                          </span>
                        )}
                        {pkg.includes_transfer && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                            <Car className="w-3 h-3" />
                            Transfer
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(pkg)}
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          pkg.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => startEdit(pkg)}
                        className="p-2 text-slate-400 hover:text-[#1a237e] hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
