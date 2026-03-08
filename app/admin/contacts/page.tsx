'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  Check,
  Reply,
  Archive,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare
} from 'lucide-react';
import { adminGet, adminPut, adminDelete } from '@/lib/auth/api-client';
import { CustomSelect } from '@/components/ui';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
}

const STATUS_OPTIONS = ['all', 'new', 'read', 'replied', 'archived'];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [page, pageSize, statusFilter]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        status: statusFilter,
        search: searchTerm,
      });

      const response = await adminGet(`/api/admin/contacts?${params}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setContacts(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchContacts();
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const response = await adminPut('/api/admin/contacts', { id, status });

      if (response.ok) {
        setContacts(contacts.map(c => c.id === id ? { ...c, status: status as ContactSubmission['status'] } : c));
        if (selectedContact?.id === id) {
          setSelectedContact({ ...selectedContact, status: status as ContactSubmission['status'] });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;

    try {
      const response = await adminDelete(`/api/admin/contacts?id=${id}`);

      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== id));
        if (selectedContact?.id === id) {
          setSelectedContact(null);
        }
        setTotalCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const openContact = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (contact.status === 'new') {
      updateStatus(contact.id, 'read');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      read: 'bg-gray-100 text-gray-700',
      replied: 'bg-green-100 text-green-700',
      archived: 'bg-slate-100 text-slate-500',
    };
    return styles[status] || styles.read;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contact Submissions</h1>
          <p className="text-slate-500">View and manage contact form submissions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm mb-6">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, email, or subject..."
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
                label: status.charAt(0).toUpperCase() + status.slice(1),
              }))}
              className="w-36"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#1a237e] text-white rounded-xl hover:bg-[#0d1259] transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a237e]" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No contact submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">From</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${
                      contact.status === 'new' ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => openContact(contact)}
                  >
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`text-slate-800 ${contact.status === 'new' ? 'font-semibold' : ''}`}>
                          {contact.name}
                        </p>
                        <p className="text-sm text-slate-500">{contact.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-slate-800 truncate max-w-xs ${contact.status === 'new' ? 'font-semibold' : ''}`}>
                        {contact.subject}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openContact(contact)}
                          className="p-2 text-slate-400 hover:text-[#1a237e] hover:bg-slate-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
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
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedContact.subject}</h2>
                <p className="text-sm text-slate-500">
                  From {selectedContact.name} on {formatDate(selectedContact.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${selectedContact.email}`} className="text-[#1a237e] hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
                {selectedContact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${selectedContact.phone}`} className="text-[#1a237e] hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-slate-700 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <span className="text-sm text-slate-500 mr-2">Status:</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedContact.status)}`}>
                  {selectedContact.status}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex flex-wrap gap-3">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                onClick={() => updateStatus(selectedContact.id, 'replied')}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-xl hover:bg-[#0d1259] transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply via Email
              </a>
              {selectedContact.status !== 'replied' && (
                <button
                  onClick={() => updateStatus(selectedContact.id, 'replied')}
                  disabled={updating}
                  className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Mark as Replied
                </button>
              )}
              {selectedContact.status !== 'archived' && (
                <button
                  onClick={() => updateStatus(selectedContact.id, 'archived')}
                  disabled={updating}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              )}
              <button
                onClick={() => {
                  deleteContact(selectedContact.id);
                  setSelectedContact(null);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
