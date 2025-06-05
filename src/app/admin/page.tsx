'use client';

import { useState, useEffect } from 'react';
import { guestService, rsvpService, statsService, budgetService, generateInvitationLink, generateWhatsAppMessage, Guest, RSVP, MonthlyBudget, IncomeItem, ExpenseItem } from '@/lib/supabase';

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
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps' | 'stats' | 'budget'>('guests');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    partner: '',
    phone: '',
    from_side: 'adel' as 'adel' | 'eko'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Budget Planner State
  const [monthlyBudgets, setMonthlyBudgets] = useState<(MonthlyBudget & { income_items: IncomeItem[], expense_items: ExpenseItem[] })[]>([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddMonthModal, setShowAddMonthModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    source: '',
    amount: '',
    status: 'planned' as 'received' | 'pending' | 'planned',
    date_received: '',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    item_name: '',
    category: 'Venue',
    estimated_cost: '',
    actual_cost: '',
    status: 'planned' as 'paid' | 'pending' | 'planned',
    payment_date: '',
    vendor: '',
    notes: ''
  });

  const [monthForm, setMonthForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    loadData();
    loadBudgetData();
  }, []);

  // Budget Functions
  const handleAddMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];

      const newBudget = await budgetService.createMonthlyBudget({
        month: monthForm.month,
        year: monthForm.year,
        month_name: `${monthNames[monthForm.month - 1]} ${monthForm.year}`,
        total_income: 0,
        total_expense: 0,
        balance: 0
      });

      setMonthlyBudgets([...monthlyBudgets, { ...newBudget, income_items: [], expense_items: [] }]);
      setShowAddMonthModal(false);
      setMonthForm({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      alert('Bulan berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding month:', error);
      alert('Error menambah bulan. Silakan coba lagi.');
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newIncome = await budgetService.addIncomeItem({
        monthly_budget_id: selectedMonth,
        source: incomeForm.source,
        amount: parseFloat(incomeForm.amount),
        status: incomeForm.status,
        date_received: incomeForm.date_received || undefined,
        notes: incomeForm.notes || undefined
      });

      // Reload budget data to get updated totals
      await loadBudgetData();
      setShowIncomeModal(false);
      setIncomeForm({ source: '', amount: '', status: 'planned', date_received: '', notes: '' });
      alert('Pendapatan berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding income:', error);
      alert('Error menambah pendapatan. Silakan coba lagi.');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newExpense = await budgetService.addExpenseItem({
        monthly_budget_id: selectedMonth,
        item_name: expenseForm.item_name,
        category: expenseForm.category,
        estimated_cost: parseFloat(expenseForm.estimated_cost),
        actual_cost: expenseForm.actual_cost ? parseFloat(expenseForm.actual_cost) : undefined,
        status: expenseForm.status,
        payment_date: expenseForm.payment_date || undefined,
        vendor: expenseForm.vendor || undefined,
        notes: expenseForm.notes || undefined
      });

      // Reload budget data to get updated totals
      await loadBudgetData();
      setShowExpenseModal(false);
      setExpenseForm({
        item_name: '', category: 'Venue', estimated_cost: '', actual_cost: '',
        status: 'planned', payment_date: '', vendor: '', notes: ''
      });
      alert('Pengeluaran berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error menambah pengeluaran. Silakan coba lagi.');
    }
  };

  // Load budget data from database
  const loadBudgetData = async () => {
    try {
      const budgets = await budgetService.getAllMonthlyBudgets();
      setMonthlyBudgets(budgets);
    } catch (error) {
      console.error('Error loading budget data:', error);
      setMonthlyBudgets([]);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <span className="text-2xl">💍</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Wedding Admin
          </h1>
          <p className="text-gray-600 text-sm lg:text-base">Adelita & Ansyah Wedding Management</p>
        </div>

        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <nav className="flex space-x-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('guests')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'guests'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span>👥</span>
                <span>Guests ({guests.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('rsvps')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'rsvps'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span>💌</span>
                <span>RSVPs ({rsvps.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'stats'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span>📊</span>
                <span>Statistics</span>
              </button>
              <button
                onClick={() => setActiveTab('budget')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'budget'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span>💰</span>
                <span>Budget</span>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Add Guest Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 lg:p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Add New Guest</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      👤 Nama Tamu *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 focus:bg-white transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Budi Santoso"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      💕 Pasangan
                    </label>
                    <input
                      type="text"
                      value={formData.partner}
                      onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 focus:bg-white transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="Siti Rahayu"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      📱 Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 focus:bg-white transition-all duration-200 text-sm placeholder-gray-400"
                      placeholder="081234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      🎭 Tamu dari *
                    </label>
                    <select
                      value={formData.from_side}
                      onChange={(e) => setFormData({ ...formData, from_side: e.target.value as 'adel' | 'eko' })}
                      className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 focus:bg-white transition-all duration-200 text-sm"
                      required
                    >
                      <option value="adel">👰 Adel</option>
                      <option value="eko">🤵 Eko</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full lg:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 font-semibold text-sm lg:text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? '✨ Adding...' : '✨ Add Guest'}
                </button>
              </form>
            </div>

            {/* Guests List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
              <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">👥</span>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Guest List</h2>
                </div>
                <button
                  onClick={regenerateLinks}
                  disabled={loading || guests.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  🔄 Regenerate Links
                </button>
              </div>
              <div className="p-6">
                {guests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-gray-500 text-lg">No guests yet</p>
                    <p className="text-gray-400 text-sm">Add your first guest above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guests.map((guest) => (
                      <div key={guest.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:scale-105">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{guest.name}</h3>
                            {guest.partner && (
                              <p className="text-gray-600 text-sm">💕 {guest.partner}</p>
                            )}
                            {guest.phone && (
                              <p className="text-gray-500 text-xs mt-1">📱 {guest.phone}</p>
                            )}
                          </div>
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            guest.from_side === 'adel'
                              ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800'
                              : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                          }`}>
                            {guest.from_side === 'adel' ? '👰 Adel' : '🤵 Eko'}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              copyToClipboard(guest.whatsapp_message, 'WhatsApp Message');
                            }}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                          >
                            💬 Copy Message
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-md"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Budget Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Wedding Budget Planner</h2>
              <button
                onClick={() => setShowAddMonthModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                + Tambah Bulan
              </button>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rp {monthlyBudgets.reduce((sum, month) => sum + month.total_income, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💸</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      Rp {monthlyBudgets.reduce((sum, month) => sum + month.total_expense, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      monthlyBudgets.reduce((sum, month) => sum + month.balance, 0) >= 0
                        ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <span className="text-white text-sm font-bold">💚</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Saldo</p>
                    <p className={`text-2xl font-semibold ${
                      monthlyBudgets.reduce((sum, month) => sum + month.balance, 0) >= 0
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Rp {monthlyBudgets.reduce((sum, month) => sum + month.balance, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Budget Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {monthlyBudgets.map((month) => (
                <div key={month.id} className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">📅 {month.month_name}</h3>
                  </div>

                  <div className="p-6">
                    {/* Income Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-green-600">💰 Pendapatan</h4>
                        <button
                          onClick={() => {
                            setSelectedMonth(month.id);
                            setShowIncomeModal(true);
                          }}
                          className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                        >
                          + Tambah
                        </button>
                      </div>
                      <div className="space-y-2">
                        {month.income_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <span className={`mr-2 ${
                                item.status === 'received' ? '✅' :
                                item.status === 'pending' ? '⏳' : '❌'
                              }`}></span>
                              <span>{item.source}</span>
                            </div>
                            <span className="font-medium">Rp {item.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium text-green-600">
                          <span>Total:</span>
                          <span>Rp {month.total_income.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expense Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-red-600">💸 Pengeluaran</h4>
                        <button
                          onClick={() => {
                            setSelectedMonth(month.id);
                            setShowExpenseModal(true);
                          }}
                          className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                        >
                          + Tambah
                        </button>
                      </div>
                      <div className="space-y-2">
                        {month.expense_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                              <span className={`mr-2 ${
                                item.status === 'paid' ? '✅' :
                                item.status === 'pending' ? '⏳' : '❌'
                              }`}></span>
                              <span>{item.item_name}</span>
                            </div>
                            <span className="font-medium">Rp {item.estimated_cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium text-red-600">
                          <span>Total:</span>
                          <span>Rp {month.total_expense.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className={`p-3 rounded-lg ${
                      month.balance >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Saldo:</span>
                        <span className={`font-bold ${month.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.balance >= 0 ? '+' : ''}Rp {month.balance.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs mt-1">
                        {month.balance >= 0 ? '💚 Surplus' : '🔴 Deficit'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* Add Month Modal */}
        {showAddMonthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Tambah Bulan Baru</h3>
              <form onSubmit={handleAddMonth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                  <select
                    value={monthForm.month}
                    onChange={(e) => setMonthForm({ ...monthForm, month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={monthForm.year}
                    onChange={(e) => setMonthForm({ ...monthForm, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2024"
                    max="2030"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMonthModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tambah
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Income Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Tambah Pendapatan</h3>
              <form onSubmit={handleAddIncome} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Pendapatan *</label>
                  <input
                    type="text"
                    value={incomeForm.source}
                    onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tabungan pribadi"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah *</label>
                  <input
                    type="number"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={incomeForm.status}
                    onChange={(e) => setIncomeForm({ ...incomeForm, status: e.target.value as 'received' | 'pending' | 'planned' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planned">Rencana</option>
                    <option value="pending">Pending</option>
                    <option value="received">Sudah Diterima</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Diterima</label>
                  <input
                    type="date"
                    value={incomeForm.date_received}
                    onChange={(e) => setIncomeForm({ ...incomeForm, date_received: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={incomeForm.notes}
                    onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Catatan tambahan..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowIncomeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Tambah
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Tambah Pengeluaran</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Item *</label>
                  <input
                    type="text"
                    value={expenseForm.item_name}
                    onChange={(e) => setExpenseForm({ ...expenseForm, item_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Booking venue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Biaya *</label>
                  <input
                    type="number"
                    value={expenseForm.estimated_cost}
                    onChange={(e) => setExpenseForm({ ...expenseForm, estimated_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Aktual</label>
                  <input
                    type="number"
                    value={expenseForm.actual_cost}
                    onChange={(e) => setExpenseForm({ ...expenseForm, actual_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="23000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={expenseForm.status}
                    onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value as 'paid' | 'pending' | 'planned' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planned">Rencana</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Sudah Bayar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama vendor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Catatan tambahan..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Tambah
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
