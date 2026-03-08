'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  UserCog,
  Trash2,
  Check,
  X,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  Pencil,
  Ban,
  UserCheck,
  AlertTriangle,
  Save,
  PenTool,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminGet, adminPatch } from '@/lib/auth/api-client';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff' | 'writer';
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

type ModalType = 'add' | 'edit' | 'delete' | null;
type RoleType = 'admin' | 'staff' | 'writer';

interface RoleOption {
  value: RoleType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to all features',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200 hover:border-blue-400',
  },
  {
    value: 'staff',
    label: 'Staff',
    description: 'Limited access to operations',
    icon: <UserCog className="w-5 h-5" />,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200 hover:border-slate-400',
  },
  {
    value: 'writer',
    label: 'Writer',
    description: 'Blog management only',
    icon: <PenTool className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
  },
];

export default function UsersPage() {
  const { adminUser: currentAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formRole, setFormRole] = useState<RoleType>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminGet('/api/admin/users');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setUsers(result.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormEmail('');
    setFormPassword('');
    setFormFullName('');
    setFormRole('admin');
    setShowPassword(false);
    setDeleteConfirmText('');
    setSelectedUser(null);
    setRoleDropdownOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalType('add');
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormFullName(user.full_name || '');
    setFormRole(user.role === 'superadmin' ? 'admin' : user.role as RoleType);
    setRoleDropdownOpen(false);
    setModalType('edit');
  };

  const openDeleteModal = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteConfirmText('');
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    resetForm();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'writer':
        return <PenTool className="w-4 h-4 text-emerald-600" />;
      default:
        return <UserCog className="w-4 h-4 text-slate-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'writer':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formEmail,
          password: formPassword,
          fullName: formFullName,
          role: formRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully!');
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/update-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.user_id,
          fullName: formFullName,
          role: formRole,
          password: formPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess('User updated successfully!');
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleBanUser = async (user: AdminUser) => {
    if (user.role === 'superadmin' && user.user_id === currentAdmin?.user_id) {
      setError("You cannot ban your own account");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const response = await adminPatch('/api/admin/users', { id: user.id, is_active: !user.is_active });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setSuccess(user.is_active ? 'User banned successfully' : 'User unbanned successfully');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || deleteConfirmText !== 'DELETE') return;

    if (selectedUser.role === 'superadmin') {
      setError("Cannot delete superadmin accounts");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/auth/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.user_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully');
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (currentAdmin?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-500">Only superadmins can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500">Create, edit, ban, and delete admin users</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] hover:bg-[#1a237e]/90 text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600">
          <Check className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isSelf = user.user_id === currentAdmin?.user_id;
                const isSuperadmin = user.role === 'superadmin';
                
                return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.is_active ? 'bg-[#1a237e]' : 'bg-slate-400'}`}>
                          <span className="text-white font-bold text-sm">
                            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium ${user.is_active ? 'text-slate-800' : 'text-slate-400'}`}>
                            {user.full_name || 'No name'}
                            {isSelf && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3" />
                            Banned
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Button */}
                        {!isSuperadmin && (
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Ban/Unban Button */}
                        {!isSelf && (
                          <button
                            onClick={() => handleBanUser(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_active
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={user.is_active ? 'Ban user' : 'Unban user'}
                          >
                            {user.is_active ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
                        
                        {/* Delete Button */}
                        {!isSuperadmin && !isSelf && (
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {modalType === 'add' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Add New User</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <div className="relative" ref={roleDropdownRef}>
                  {/* Custom Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                      roleDropdownOpen 
                        ? 'border-[#1a237e] ring-2 ring-[#1a237e]/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    } bg-white`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${roleOptions.find(r => r.value === formRole)?.bgColor}`}>
                        <span className={roleOptions.find(r => r.value === formRole)?.color}>
                          {roleOptions.find(r => r.value === formRole)?.icon}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-800">{roleOptions.find(r => r.value === formRole)?.label}</p>
                        <p className="text-xs text-slate-500">{roleOptions.find(r => r.value === formRole)?.description}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Options */}
                  {roleDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      {roleOptions.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            setFormRole(role.value);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                            formRole === role.value 
                              ? `${role.bgColor} border-l-4 border-l-current ${role.color}` 
                              : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${role.bgColor}`}>
                            <span className={role.color}>{role.icon}</span>
                          </div>
                          <div className="text-left flex-1">
                            <p className={`font-medium ${formRole === role.value ? role.color : 'text-slate-800'}`}>
                              {role.label}
                            </p>
                            <p className="text-xs text-slate-500">{role.description}</p>
                          </div>
                          {formRole === role.value && (
                            <Check className={`w-5 h-5 ${role.color}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a237e] hover:bg-[#1a237e]/90 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {modalType === 'edit' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Edit User</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-800">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1a237e] text-slate-800"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <div className="relative" ref={roleDropdownRef}>
                  {/* Custom Dropdown Trigger */}
                  <button
                    type="button"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                      roleDropdownOpen 
                        ? 'border-[#1a237e] ring-2 ring-[#1a237e]/20' 
                        : 'border-slate-200 hover:border-slate-300'
                    } bg-white`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${roleOptions.find(r => r.value === formRole)?.bgColor}`}>
                        <span className={roleOptions.find(r => r.value === formRole)?.color}>
                          {roleOptions.find(r => r.value === formRole)?.icon}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-slate-800">{roleOptions.find(r => r.value === formRole)?.label}</p>
                        <p className="text-xs text-slate-500">{roleOptions.find(r => r.value === formRole)?.description}</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Options */}
                  {roleDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      {roleOptions.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            setFormRole(role.value);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                            formRole === role.value 
                              ? `${role.bgColor} border-l-4 border-l-current ${role.color}` 
                              : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${role.bgColor}`}>
                            <span className={role.color}>{role.icon}</span>
                          </div>
                          <div className="text-left flex-1">
                            <p className={`font-medium ${formRole === role.value ? role.color : 'text-slate-800'}`}>
                              {role.label}
                            </p>
                            <p className="text-xs text-slate-500">{role.description}</p>
                          </div>
                          {formRole === role.value && (
                            <Check className={`w-5 h-5 ${role.color}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a237e] hover:bg-[#1a237e]/90 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete User</h3>
              <p className="text-slate-600 mb-4">
                Are you sure you want to permanently delete <strong>{selectedUser.full_name || selectedUser.email}</strong>?
              </p>
              <p className="text-sm text-red-600 mb-6">
                This action cannot be undone. All user data will be permanently removed.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 text-center font-mono"
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteConfirmText !== 'DELETE' || saving}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
