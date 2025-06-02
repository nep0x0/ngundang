'use client';

import { useState, useEffect } from 'react';
import { guestService, rsvpService, statsService, generateInvitationLink, generateWhatsAppMessage, Guest, RSVP } from '@/lib/supabase';

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRSVPs] = useState<RSVP[]>([]);
  const [stats, setStats] = useState<{
    totalGuests: number;
    adelGuests: number;
    ekoGuests: number;
    totalRSVPs: number;
    attending: number;
    notAttending: number;
    totalAttendingCount: number;
    responseRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps' | 'stats'>('guests');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    partner: '',
    phone: '',
    from_side: 'adel' as 'adel' | 'eko'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Testing database connection...');

      // Test guests table first
      const guestsData = await guestService.getAll();
      console.log('✅ Guests loaded:', guestsData.length);
      setGuests(guestsData);

      // Test rsvps table
      const rsvpsData = await rsvpService.getAll();
      console.log('✅ RSVPs loaded:', rsvpsData.length);
      setRSVPs(rsvpsData);

      // Test stats
      const statsData = await statsService.getGuestStats();
      console.log('✅ Stats loaded:', statsData);
      setStats(statsData);

      // If we reach here, database is ready
      setDatabaseReady(true);
      console.log('✅ Database is ready!');

    } catch (error: unknown) {
      console.error('❌ Database error details:', error);

      // More detailed error handling
      let errorMessage = 'Database connection failed. ';

      const err = error as { code?: string; message?: string };

      if (err.code === '42P01') {
        errorMessage += 'Tables do not exist. Please run the SQL setup script in Supabase.';
      } else if (err.code === '42703') {
        errorMessage += 'Column "from_side" missing. Please run the update script.';
      } else if (err.message?.includes('JWT')) {
        errorMessage += 'Authentication failed. Check your Supabase API key.';
      } else if (err.message?.includes('fetch')) {
        errorMessage += 'Network error. Check your internet connection and Supabase URL.';
      } else {
        errorMessage += `Error: ${err.message || 'Unknown error'}`;
      }

      // Fallback: set empty arrays to prevent UI issues
      setGuests([]);
      setRSVPs([]);
      setStats(null);
      setDatabaseReady(false);

      alert(errorMessage);
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
      const invitationLink = generateInvitationLink(formData.name, formData.partner || undefined, baseUrl);
      const whatsappMessage = generateWhatsAppMessage(formData.name, formData.partner || undefined, invitationLink);

      const newGuest = await guestService.create({
        name: formData.name.trim(),
        partner: formData.partner.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        from_side: formData.from_side,
        invitation_link: invitationLink,
        whatsapp_message: whatsappMessage
      });

      setGuests([newGuest, ...guests]);
      setFormData({ name: '', partner: '', phone: '', from_side: 'adel' });
      // Reload stats after adding guest
      loadData();
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
      // Reload stats after deleting guest
      loadData();
      alert('Tamu berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Error deleting guest. Please try again.');
    }
  };

  const regenerateLinks = async () => {
    if (!confirm('Regenerate semua invitation links dan WhatsApp messages? Ini akan update semua data existing.')) return;

    try {
      setLoading(true);
      const baseUrl = window.location.origin;

      for (const guest of guests) {
        const newInvitationLink = generateInvitationLink(guest.name, guest.partner || undefined, baseUrl);
        const newWhatsAppMessage = generateWhatsAppMessage(guest.name, guest.partner || undefined, newInvitationLink);

        await guestService.update(guest.id, {
          invitation_link: newInvitationLink,
          whatsapp_message: newWhatsAppMessage
        });
      }

      // Reload data to show updates
      await loadData();
      alert('✅ Semua links dan messages berhasil di-regenerate!');
    } catch (error) {
      console.error('Error regenerating links:', error);
      alert('❌ Error regenerating links. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string = 'text') => {
    try {
      console.log(`🔍 Copying ${type}:`, text.substring(0, 100) + '...');

      if (navigator.clipboard && window.isSecureContext) {
        // Modern clipboard API
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      alert(`✅ ${type} copied to clipboard!`);
      console.log(`✅ Successfully copied ${type}`);
    } catch (error) {
      console.error('❌ Copy failed:', error);
      alert('❌ Failed to copy. Please try again.');
    }
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

  // Show setup instructions only if database connection failed
  if (!databaseReady && !loading) {
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
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">Admin Panel - Wedding Invitation</h1>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('guests')}
                className={`py-2 px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${
                  activeTab === 'guests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Guests ({guests.length})
              </button>
              <button
                onClick={() => setActiveTab('rsvps')}
                className={`py-2 px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${
                  activeTab === 'rsvps'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                View RSVPs ({rsvps.length})
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-1 border-b-2 font-medium text-xs lg:text-sm whitespace-nowrap ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Add Guest Form */}
            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4">Add New Guest</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Tamu *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="081234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tamu dari *
                    </label>
                    <select
                      value={formData.from_side}
                      onChange={(e) => setFormData({ ...formData, from_side: e.target.value as 'adel' | 'eko' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    >
                      <option value="adel">Adel</option>
                      <option value="eko">Eko</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full lg:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm lg:text-base"
                >
                  {isSubmitting ? 'Adding...' : 'Add Guest'}
                </button>
              </form>
            </div>

            {/* Guests List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg lg:text-xl font-semibold">Guest List</h2>
                <button
                  onClick={regenerateLinks}
                  disabled={loading || guests.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  🔄 Regenerate Links
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Partner
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                        Phone
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guests.map((guest) => (
                      <tr key={guest.id}>
                        <td className="px-3 lg:px-6 py-4 text-sm font-medium text-gray-900">
                          <div>
                            <div className="font-medium">{guest.name}</div>
                            <div className="lg:hidden text-xs text-gray-500">
                              {guest.partner && `+ ${guest.partner}`}
                              {guest.phone && (
                                <div className="xl:hidden">{guest.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {guest.partner || '-'}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                          {guest.phone || '-'}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            guest.from_side === 'adel'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {guest.from_side === 'adel' ? 'Adel' : 'Eko'}
                          </span>
                        </td>
                        <td className="px-3 lg:px-6 py-4 text-sm font-medium">
                          <div className="flex flex-col lg:flex-row lg:space-x-2 space-y-1 lg:space-y-0">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                copyToClipboard(guest.whatsapp_message, 'WhatsApp Message');
                              }}
                              className="text-green-600 hover:text-green-900 text-xs lg:text-sm"
                            >
                              Copy Message
                            </button>
                            <button
                              onClick={() => handleDelete(guest.id)}
                              className="text-red-600 hover:text-red-900 text-xs lg:text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Tamu</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalGuests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tamu Adel</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.adelGuests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">E</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tamu Eko</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.ekoGuests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Response Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.responseRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RSVP Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Konfirmasi</span>
                    <span className="font-semibold">{stats.totalRSVPs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Akan Hadir</span>
                    <span className="font-semibold text-green-600">{stats.attending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Tidak Hadir</span>
                    <span className="font-semibold text-red-600">{stats.notAttending}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium text-gray-900">Total Kehadiran</span>
                    <span className="font-bold text-blue-600">{stats.totalAttendingCount} orang</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Rate</span>
                      <span>{stats.responseRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.responseRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Attendance Rate</span>
                      <span>{stats.totalRSVPs > 0 ? Math.round((stats.attending / stats.totalRSVPs) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${stats.totalRSVPs > 0 ? Math.round((stats.attending / stats.totalRSVPs) * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-pink-600">Adel&apos;s Guests</span>
                    <span className="font-semibold">{stats.adelGuests}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full"
                      style={{ width: `${stats.totalGuests > 0 ? (stats.adelGuests / stats.totalGuests) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600">Eko&apos;s Guests</span>
                    <span className="font-semibold">{stats.ekoGuests}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${stats.totalGuests > 0 ? (stats.ekoGuests / stats.totalGuests) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rsvps' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold">RSVP Responses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Name
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Guest Count
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      Message
                    </th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id}>
                      <td className="px-3 lg:px-6 py-4 text-sm font-medium text-gray-900">
                        <div>
                          <div className="font-medium">{rsvp.guest_name}</div>
                          <div className="lg:hidden text-xs text-gray-500">
                            {rsvp.guest_count} orang • {new Date(rsvp.created_at).toLocaleDateString('id-ID')}
                            {rsvp.message && (
                              <div className="xl:hidden mt-1 truncate max-w-xs">{rsvp.message}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rsvp.attendance === 'hadir'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rsvp.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {rsvp.guest_count} orang
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden xl:table-cell">
                        {rsvp.message || '-'}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
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
