'use client';

import { useState, useEffect } from 'react';
import { guestService, rsvpService, generateInvitationLink, generateWhatsAppMessage, Guest, RSVP } from '@/lib/supabase';

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps'>('guests');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    partner: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [guestsData, rsvpsData] = await Promise.all([
        guestService.getAll(),
        rsvpService.getAll()
      ]);
      setGuests(guestsData);
      setRSVPs(rsvpsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback: set empty arrays to prevent UI issues
      setGuests([]);
      setRSVPs([]);
      alert('Database belum tersedia. Silakan setup Supabase terlebih dahulu. Lihat file supabase_setup.sql');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const baseUrl = window.location.origin;
      const invitationLink = generateInvitationLink(formData.name, baseUrl);
      const whatsappMessage = generateWhatsAppMessage(formData.name, formData.partner || undefined, invitationLink);

      const newGuest = await guestService.create({
        name: formData.name.trim(),
        partner: formData.partner.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        invitation_link: invitationLink,
        whatsapp_message: whatsappMessage
      });

      setGuests([newGuest, ...guests]);
      setFormData({ name: '', partner: '', phone: '' });
      alert('Tamu berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding guest:', error);
      alert('Database belum tersedia. Silakan setup Supabase terlebih dahulu. Lihat file supabase_setup.sql untuk instruksi setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tamu ini?')) return;

    try {
      await guestService.delete(id);
      setGuests(guests.filter(g => g.id !== id));
      alert('Tamu berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Error deleting guest. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show setup instructions if no data and likely database not setup
  const showSetupInstructions = guests.length === 0 && rsvps.length === 0;

  if (showSetupInstructions) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Database Setup Required</h1>
                <p className="text-gray-600 mb-8">
                  Untuk menggunakan admin panel, Anda perlu setup database Supabase terlebih dahulu.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4">📋 Langkah Setup:</h2>
                  <ol className="list-decimal list-inside space-y-2 text-blue-700">
                    <li>Login ke <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                    <li>Buka project Anda</li>
                    <li>Go to <strong>SQL Editor</strong></li>
                    <li>Copy-paste isi file <code className="bg-blue-100 px-2 py-1 rounded">supabase_setup.sql</code></li>
                    <li>Run SQL script</li>
                    <li>Refresh halaman ini</li>
                  </ol>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">📁 File yang Diperlukan:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <code className="bg-gray-100 px-2 py-1 rounded">supabase_setup.sql</code> - Database schema</li>
                    <li>• <code className="bg-gray-100 px-2 py-1 rounded">ADMIN_SYSTEM_GUIDE.md</code> - Dokumentasi lengkap</li>
                  </ul>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔄 Refresh Setelah Setup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel - Wedding Invitation</h1>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('guests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'guests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Guests ({guests.length})
              </button>
              <button
                onClick={() => setActiveTab('rsvps')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rsvps'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                View RSVPs ({rsvps.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Add Guest Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Guest</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Tamu *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Budi Santoso"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pasangan (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.partner}
                      onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Siti Rahayu"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="081234567890"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Guest'}
                </button>
              </form>
            </div>

            {/* Guests List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Guest List</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guests.map((guest) => (
                      <tr key={guest.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {guest.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guest.partner || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guest.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => copyToClipboard(guest.invitation_link)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => copyToClipboard(guest.whatsapp_message)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Copy Message
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rsvps' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">RSVP Responses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rsvp.guest_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rsvp.attendance === 'hadir' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rsvp.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rsvp.guest_count} orang
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {rsvp.message || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rsvp.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
