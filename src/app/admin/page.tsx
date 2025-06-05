'use client';

import { useState, useEffect } from 'react';
import { guestService, rsvpService, statsService, budgetService, weddingInfoService, generateInvitationLink, generateWhatsAppMessage, Guest, RSVP, MonthlyBudget, IncomeItem, ExpenseItem, WeddingInfo } from '@/lib/supabase';

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
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps' | 'stats' | 'budget' | 'wedding'>('guests');

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

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add guest form state
  const [showAddForm, setShowAddForm] = useState(false);

  // Wedding info state
  const [weddingInfo, setWeddingInfo] = useState<WeddingInfo | null>(null);

  useEffect(() => {
    loadData();
    loadBudgetData();
    loadWeddingInfo();
  }, []);

  // Load wedding info from database
  const loadWeddingInfo = async () => {
    try {
      console.log('🔍 Loading wedding info...');
      const info = await weddingInfoService.getWeddingInfo();
      console.log('✅ Wedding info loaded:', info);
      setWeddingInfo(info);
    } catch (error) {
      console.error('❌ Error loading wedding info:', error);

      // If no wedding info exists, create default
      try {
        console.log('🔧 Creating default wedding info...');
        const defaultInfo = await weddingInfoService.createWeddingInfo({
          bride_full_name: 'Adelita Sari Kuswanto',
          bride_nickname: 'Adelita',
          bride_initial: 'A',
          groom_full_name: 'Ansyah Eko Santoso',
          groom_nickname: 'Ansyah',
          groom_initial: 'A',
          akad_date: '2025-02-15',
          akad_time: '08:00',
          akad_venue_name: 'Masjid Al-Ikhlas',
          akad_venue_address: 'Jl. Masjid No. 45, Jakarta Selatan',
          akad_maps_url: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637257!5m2!1sid!2sid',
          resepsi_date: '2025-02-15',
          resepsi_time: '11:00',
          resepsi_venue_name: 'Gedung Serbaguna',
          resepsi_venue_address: 'Jl. Raya No. 123, Jakarta Selatan',
          resepsi_maps_url: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637258!5m2!1sid!2sid',
          bride_father: 'Bapak Andi Kuswanto (Alm)',
          bride_mother: 'Ibu Yulita Anggraini',
          bride_child_order: 'Putri Kedua',
          groom_father: 'Bapak Ahmad Santoso',
          groom_mother: 'Ibu Siti Rahayu',
          groom_child_order: 'Putra Pertama',
          maps_display_option: 'both' as const
        });
        console.log('✅ Default wedding info created:', defaultInfo);
        setWeddingInfo(defaultInfo);
      } catch (createError) {
        console.error('❌ Error creating default wedding info:', createError);
        alert('Database connection failed. Please check Supabase setup.');
      }
    }
  };

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
      await budgetService.addIncomeItem({
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
      await budgetService.addExpenseItem({
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

  // Delete Functions
  const handleDeleteIncome = async (incomeId: string, monthlyBudgetId: string, source: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pendapatan "${source}"?`)) {
      try {
        await budgetService.deleteIncomeItem(incomeId, monthlyBudgetId);
        await loadBudgetData();
        alert('Pendapatan berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting income:', error);
        alert('Error menghapus pendapatan. Silakan coba lagi.');
      }
    }
  };

  const handleDeleteExpense = async (expenseId: string, monthlyBudgetId: string, itemName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengeluaran "${itemName}"?`)) {
      try {
        await budgetService.deleteExpenseItem(expenseId, monthlyBudgetId);
        await loadBudgetData();
        alert('Pengeluaran berhasil dihapus!');
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error menghapus pengeluaran. Silakan coba lagi.');
      }
    }
  };

  const handleDeleteMonth = async (monthId: string, monthName: string) => {
    try {
      // Get month details with item counts
      const monthDetails = await budgetService.getMonthlyBudgetWithCounts(monthId);

      let confirmMessage = `Apakah Anda yakin ingin menghapus bulan "${monthName}"?`;

      if (monthDetails.totalItems > 0) {
        confirmMessage += `\n\nBulan ini memiliki:\n`;
        if (monthDetails.incomeCount > 0) {
          confirmMessage += `• ${monthDetails.incomeCount} item pendapatan\n`;
        }
        if (monthDetails.expenseCount > 0) {
          confirmMessage += `• ${monthDetails.expenseCount} item pengeluaran\n`;
        }
        confirmMessage += `\nSemua item di dalam bulan ini akan ikut terhapus!`;
      }

      if (confirm(confirmMessage)) {
        await budgetService.deleteMonthlyBudget(monthId);
        await loadBudgetData();
        alert('Bulan berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting month:', error);
      alert('Error menghapus bulan. Silakan coba lagi.');
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
      setShowAddForm(false); // Close form after successful submission
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

  // Wedding Info Functions with Debouncing
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleUpdateWeddingInfo = async (updatedInfo: Partial<WeddingInfo>) => {
    if (!weddingInfo) {
      console.error('❌ No wedding info loaded');
      return;
    }

    // Update local state immediately for responsive UI
    setWeddingInfo({ ...weddingInfo, ...updatedInfo });

    // Clear existing timeout
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    // Set saving status
    setSaveStatus('saving');

    // Debounce the actual database update
    const newTimeout = setTimeout(async () => {
      try {
        console.log('🔄 Auto-saving wedding info:', updatedInfo);
        const updated = await weddingInfoService.updateWeddingInfo(updatedInfo);
        console.log('✅ Wedding info auto-saved');
        setWeddingInfo(updated);
        setSaveStatus('saved');

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('❌ Error auto-saving wedding info:', error);
        setSaveStatus('error');

        // Show error alert only on actual errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Error saving wedding information: ${errorMessage}`);

        // Reset to idle after error
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1500); // Wait 1.5 seconds after user stops typing

    setUpdateTimeout(newTimeout);
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

  const menuItems = [
    { id: 'guests', icon: '👥', label: 'Guests', count: guests.length, color: 'rose' },
    { id: 'rsvps', icon: '💌', label: 'RSVPs', count: rsvps.length, color: 'blue' },
    { id: 'stats', icon: '📊', label: 'Statistics', count: null, color: 'emerald' },
    { id: 'budget', icon: '💰', label: 'Budget', count: null, color: 'amber' },
    { id: 'wedding', icon: '💍', label: 'Wedding Info', count: null, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-rose-200 to-pink-200 rounded-2xl flex items-center justify-center">
              <span className="text-lg">💍</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-700">Wedding Admin</h1>
              <p className="text-xs text-slate-500">Adelita & Ansyah</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="text-slate-500">✕</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const getActiveClasses = (color: string) => {
              switch (color) {
                case 'rose': return 'bg-rose-100 text-rose-700 shadow-sm';
                case 'blue': return 'bg-blue-100 text-blue-700 shadow-sm';
                case 'emerald': return 'bg-emerald-100 text-emerald-700 shadow-sm';
                case 'amber': return 'bg-amber-100 text-amber-700 shadow-sm';
                case 'purple': return 'bg-purple-100 text-purple-700 shadow-sm';
                default: return 'bg-slate-100 text-slate-700 shadow-sm';
              }
            };

            const getBadgeClasses = (color: string) => {
              switch (color) {
                case 'rose': return 'bg-rose-200 text-rose-800';
                case 'blue': return 'bg-blue-200 text-blue-800';
                case 'emerald': return 'bg-emerald-200 text-emerald-800';
                case 'amber': return 'bg-amber-200 text-amber-800';
                case 'purple': return 'bg-purple-200 text-purple-800';
                default: return 'bg-slate-200 text-slate-800';
              }
            };

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as 'guests' | 'rsvps' | 'stats' | 'budget' | 'wedding');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
                  activeTab === item.id
                    ? getActiveClasses(item.color)
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== null && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === item.id
                      ? getBadgeClasses(item.color)
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <div className="text-center">
            <p className="text-xs text-slate-500">Wedding Management System</p>
            <p className="text-xs text-slate-400 mt-1">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white/95 backdrop-blur-sm border-b border-slate-200/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="text-slate-600">☰</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-rose-200 to-pink-200 rounded-xl flex items-center justify-center">
              <span className="text-sm">💍</span>
            </div>
            <span className="font-semibold text-slate-700">Wedding Admin</span>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">

        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* Add Guest Button/Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50">
              {!showAddForm ? (
                <div className="p-4">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all duration-300 font-medium"
                  >
                    <span>✨</span>
                    <span>Add New Guest</span>
                  </button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
                        <span className="text-rose-600">✨</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700">Add New Guest</h3>
                    </div>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          👤 Nama Tamu *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 text-sm placeholder-slate-400"
                          placeholder="Budi Santoso"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          💕 Pasangan
                        </label>
                        <input
                          type="text"
                          value={formData.partner}
                          onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 text-sm placeholder-slate-400"
                          placeholder="Siti Rahayu"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          📱 Phone
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 text-sm placeholder-slate-400"
                          placeholder="081234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          🎭 Tamu dari *
                        </label>
                        <select
                          value={formData.from_side}
                          onChange={(e) => setFormData({ ...formData, from_side: e.target.value as 'adel' | 'eko' })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-300 focus:bg-white transition-all duration-300 text-sm"
                          required
                        >
                          <option value="adel">👰 Adel</option>
                          <option value="eko">🤵 Eko</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:opacity-50 font-medium text-sm transition-all duration-300"
                      >
                        {isSubmitting ? 'Adding...' : 'Add Guest'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Guests List */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50">
              <div className="px-4 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600">👥</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Guest List ({guests.length})</h3>
                </div>
                <button
                  onClick={regenerateLinks}
                  disabled={loading || guests.length === 0}
                  className="bg-blue-500 text-white px-3 py-2 rounded-xl hover:bg-blue-600 disabled:opacity-50 text-sm font-medium transition-all duration-300"
                >
                  🔄 Regenerate Links
                </button>
              </div>

              {guests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-slate-500">No guests yet</p>
                  <p className="text-slate-400 text-sm">Add your first guest above!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Guest</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 hidden md:table-cell">Partner</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 hidden lg:table-cell">Phone</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">From</th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {guests.map((guest, index) => (
                        <tr
                          key={guest.id}
                          className={`transition-colors hover:bg-rose-50 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-rose-25'
                          }`}
                          style={index % 2 !== 0 ? { backgroundColor: '#fef7f7' } : {}}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-slate-800">{guest.name}</div>
                              <div className="md:hidden text-xs text-slate-500 mt-1">
                                {guest.partner && <div>💕 {guest.partner}</div>}
                                {guest.phone && <div className="lg:hidden">📱 {guest.phone}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">
                            {guest.partner || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">
                            {guest.phone || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              guest.from_side === 'adel'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {guest.from_side === 'adel' ? '👰 Adel' : '🤵 Eko'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  copyToClipboard(guest.whatsapp_message, 'WhatsApp Message');
                                }}
                                className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all duration-300"
                                title="Copy WhatsApp Message"
                              >
                                💬
                              </button>
                              <button
                                onClick={() => handleDelete(guest.id)}
                                className="bg-rose-500 text-white px-2 py-1 rounded-lg text-xs font-medium hover:bg-rose-600 transition-all duration-300"
                                title="Delete Guest"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <span className="text-amber-600 text-lg">💰</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-700">Wedding Budget Planner</h2>
              </div>
              <button
                onClick={() => setShowAddMonthModal(true)}
                className="bg-amber-500 text-white px-4 py-2 rounded-2xl hover:bg-amber-600 text-sm font-medium shadow-sm transition-all duration-300"
              >
                + Tambah Bulan
              </button>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl shadow-sm p-6 border border-emerald-200/50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-200 rounded-2xl flex items-center justify-center">
                      <span className="text-emerald-700 text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-emerald-700">Total Pendapatan</p>
                    <p className="text-2xl font-semibold text-emerald-800">
                      Rp {monthlyBudgets.reduce((sum, month) => sum + month.total_income, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-3xl shadow-sm p-6 border border-rose-200/50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-rose-200 rounded-2xl flex items-center justify-center">
                      <span className="text-rose-700 text-lg">💸</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-rose-700">Total Pengeluaran</p>
                    <p className="text-2xl font-semibold text-rose-800">
                      Rp {monthlyBudgets.reduce((sum, month) => sum + month.total_expense, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl shadow-sm p-6 border ${
                monthlyBudgets.reduce((sum, month) => sum + month.balance, 0) >= 0
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50'
                  : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      monthlyBudgets.reduce((sum, month) => sum + month.balance, 0) >= 0
                        ? 'bg-blue-200' : 'bg-orange-200'
                    }`}>
                      <span className={`text-lg ${
                        monthlyBudgets.reduce((sum, month) => sum + month.balance, 0) >= 0
                          ? 'text-blue-700' : 'text-orange-700'
                      }`}>💚</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className={`text-sm font-medium ${
                      monthlyBudgets.reduce((sum, month) => sum + month.balance, 0) >= 0
                        ? 'text-blue-700' : 'text-orange-700'
                    }`}>Saldo</p>
                    <p className={`text-2xl font-semibold ${
                      monthlyBudgets.reduce((sum, month) => sum + month.balance, 0) >= 0
                        ? 'text-blue-800' : 'text-orange-800'
                    }`}>
                      Rp {monthlyBudgets.reduce((sum, month) => sum + month.balance, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Budget Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {monthlyBudgets.map((month, index) => {
                const cardColors = [
                  'from-violet-50 to-violet-100 border-violet-200/50',
                  'from-cyan-50 to-cyan-100 border-cyan-200/50',
                  'from-pink-50 to-pink-100 border-pink-200/50',
                  'from-amber-50 to-amber-100 border-amber-200/50',
                  'from-lime-50 to-lime-100 border-lime-200/50',
                  'from-indigo-50 to-indigo-100 border-indigo-200/50'
                ];
                const headerColors = [
                  'bg-violet-200 text-violet-700',
                  'bg-cyan-200 text-cyan-700',
                  'bg-pink-200 text-pink-700',
                  'bg-amber-200 text-amber-700',
                  'bg-lime-200 text-lime-700',
                  'bg-indigo-200 text-indigo-700'
                ];
                const buttonColors = [
                  'bg-violet-100 text-violet-600 hover:bg-violet-200',
                  'bg-cyan-100 text-cyan-600 hover:bg-cyan-200',
                  'bg-pink-100 text-pink-600 hover:bg-pink-200',
                  'bg-amber-100 text-amber-600 hover:bg-amber-200',
                  'bg-lime-100 text-lime-600 hover:bg-lime-200',
                  'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                ];
                const colorIndex = index % cardColors.length;

                return (
                  <div key={month.id} className={`bg-gradient-to-br ${cardColors[colorIndex]} rounded-3xl shadow-sm border`}>
                    <div className="px-6 py-4 border-b border-white/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${headerColors[colorIndex]} rounded-2xl flex items-center justify-center`}>
                            <span className="text-lg">📅</span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-700">{month.month_name}</h3>
                        </div>
                        <button
                          onClick={() => handleDeleteMonth(month.id, month.month_name)}
                          className="w-8 h-8 bg-rose-100 hover:bg-rose-200 rounded-xl flex items-center justify-center transition-all duration-300 group"
                          title="Hapus Bulan"
                        >
                          <span className="text-rose-600 group-hover:text-rose-700 text-sm">🗑️</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Income Section */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-emerald-700">💰 Pendapatan</h4>
                          <button
                            onClick={() => {
                              setSelectedMonth(month.id);
                              setShowIncomeModal(true);
                            }}
                            className={`text-xs ${buttonColors[colorIndex]} px-3 py-1.5 rounded-xl font-medium transition-all duration-300`}
                          >
                            + Tambah
                          </button>
                        </div>
                        <div className="space-y-2">
                          {month.income_items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm bg-white/50 rounded-xl p-3 group">
                              <div className="flex items-center flex-1">
                                <span className={`mr-2 ${
                                  item.status === 'received' ? '✅' :
                                  item.status === 'pending' ? '⏳' : '❌'
                                }`}></span>
                                <span className="text-slate-700 flex-1">{item.source}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-slate-800">Rp {item.amount.toLocaleString()}</span>
                                <button
                                  onClick={() => handleDeleteIncome(item.id, month.id, item.source)}
                                  className="w-6 h-6 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                                  title="Hapus Pendapatan"
                                >
                                  <span className="text-rose-600 text-xs">🗑️</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-white/50 pt-3 mt-3">
                          <div className="flex justify-between font-semibold text-emerald-700">
                            <span>Total:</span>
                            <span>Rp {month.total_income.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expense Section */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-rose-700">💸 Pengeluaran</h4>
                          <button
                            onClick={() => {
                              setSelectedMonth(month.id);
                              setShowExpenseModal(true);
                            }}
                            className={`text-xs ${buttonColors[colorIndex]} px-3 py-1.5 rounded-xl font-medium transition-all duration-300`}
                          >
                            + Tambah
                          </button>
                        </div>
                        <div className="space-y-2">
                          {month.expense_items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm bg-white/50 rounded-xl p-3 group">
                              <div className="flex items-center flex-1">
                                <span className={`mr-2 ${
                                  item.status === 'paid' ? '✅' :
                                  item.status === 'pending' ? '⏳' : '❌'
                                }`}></span>
                                <span className="text-slate-700 flex-1">{item.item_name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-slate-800">Rp {item.estimated_cost.toLocaleString()}</span>
                                <button
                                  onClick={() => handleDeleteExpense(item.id, month.id, item.item_name)}
                                  className="w-6 h-6 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                                  title="Hapus Pengeluaran"
                                >
                                  <span className="text-rose-600 text-xs">🗑️</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-white/50 pt-3 mt-3">
                          <div className="flex justify-between font-semibold text-rose-700">
                            <span>Total:</span>
                            <span>Rp {month.total_expense.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Balance */}
                      <div className={`p-4 rounded-2xl ${
                        month.balance >= 0 ? 'bg-emerald-100/50 border border-emerald-200' : 'bg-rose-100/50 border border-rose-200'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-700">Saldo:</span>
                          <span className={`font-semibold ${month.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {month.balance >= 0 ? '+' : ''}Rp {month.balance.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs mt-1 text-slate-600">
                          {month.balance >= 0 ? '💚 Surplus' : '🔴 Deficit'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {activeTab === 'wedding' && (
          <div className="space-y-6">
            {/* Wedding Info Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-purple-600 text-lg">💍</span>
                </div>
                <h2 className="text-2xl font-semibold text-slate-700">Wedding Information</h2>
              </div>

              {/* Save Status Indicator */}
              <div className="flex items-center space-x-2">
                {saveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <span className="text-sm">✅</span>
                    <span className="text-sm">Saved</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-rose-600">
                    <span className="text-sm">❌</span>
                    <span className="text-sm">Error</span>
                  </div>
                )}
              </div>
            </div>

            {weddingInfo ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Couple Information Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-slate-200/50">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center space-x-2">
                    <span>👰🤵</span>
                    <span>Couple Information</span>
                  </h3>
                  <div className="space-y-6">
                    {/* Bride Information */}
                    <div>
                      <h4 className="text-md font-medium text-slate-600 mb-3 flex items-center space-x-2">
                        <span>👰</span>
                        <span>Bride</span>
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={weddingInfo.bride_full_name}
                            onChange={(e) => handleUpdateWeddingInfo({ bride_full_name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Adelita Sari Kuswanto"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Nickname</label>
                          <input
                            type="text"
                            value={weddingInfo.bride_nickname}
                            onChange={(e) => handleUpdateWeddingInfo({ bride_nickname: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Adelita"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Initial</label>
                          <input
                            type="text"
                            value={weddingInfo.bride_initial}
                            onChange={(e) => handleUpdateWeddingInfo({ bride_initial: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            maxLength={2}
                            placeholder="A"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Groom Information */}
                    <div>
                      <h4 className="text-md font-medium text-slate-600 mb-3 flex items-center space-x-2">
                        <span>🤵</span>
                        <span>Groom</span>
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={weddingInfo.groom_full_name}
                            onChange={(e) => handleUpdateWeddingInfo({ groom_full_name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Ansyah Eko Santoso"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Nickname</label>
                          <input
                            type="text"
                            value={weddingInfo.groom_nickname}
                            onChange={(e) => handleUpdateWeddingInfo({ groom_nickname: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Ansyah"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Initial</label>
                          <input
                            type="text"
                            value={weddingInfo.groom_initial}
                            onChange={(e) => handleUpdateWeddingInfo({ groom_initial: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            maxLength={2}
                            placeholder="A"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-slate-200/50 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center space-x-2">
                    <span>📅</span>
                    <span>Event Details</span>
                  </h3>
                  <div className="space-y-6">
                    {/* Akad Event */}
                    <div>
                      <h4 className="text-md font-medium text-slate-600 mb-3 flex items-center space-x-2">
                        <span>🕌</span>
                        <span>Akad Nikah</span>
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                          <input
                            type="date"
                            value={weddingInfo.akad_date}
                            onChange={(e) => handleUpdateWeddingInfo({ akad_date: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
                          <input
                            type="time"
                            value={weddingInfo.akad_time}
                            onChange={(e) => handleUpdateWeddingInfo({ akad_time: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Venue Name</label>
                          <input
                            type="text"
                            value={weddingInfo.akad_venue_name}
                            onChange={(e) => handleUpdateWeddingInfo({ akad_venue_name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Masjid Al-Ikhlas"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                          <input
                            type="text"
                            value={weddingInfo.akad_venue_address}
                            onChange={(e) => handleUpdateWeddingInfo({ akad_venue_address: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Full address"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-slate-600">Google Maps URL</label>
                          {weddingInfo.akad_maps_url && (
                            <button
                              onClick={() => window.open(weddingInfo.akad_maps_url, '_blank')}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              📍 Test
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          value={weddingInfo.akad_maps_url}
                          onChange={(e) => handleUpdateWeddingInfo({ akad_maps_url: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                          placeholder="https://www.google.com/maps/embed?pb=..."
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Gunakan Google Maps embed URL (Share → Embed → Copy HTML → ambil src URL)
                        </p>
                      </div>
                    </div>

                    {/* Resepsi Event */}
                    <div>
                      <h4 className="text-md font-medium text-slate-600 mb-3 flex items-center space-x-2">
                        <span>🎉</span>
                        <span>Resepsi</span>
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
                          <input
                            type="date"
                            value={weddingInfo.resepsi_date}
                            onChange={(e) => handleUpdateWeddingInfo({ resepsi_date: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
                          <input
                            type="time"
                            value={weddingInfo.resepsi_time}
                            onChange={(e) => handleUpdateWeddingInfo({ resepsi_time: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Venue Name</label>
                          <input
                            type="text"
                            value={weddingInfo.resepsi_venue_name}
                            onChange={(e) => handleUpdateWeddingInfo({ resepsi_venue_name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Gedung Serbaguna"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                          <input
                            type="text"
                            value={weddingInfo.resepsi_venue_address}
                            onChange={(e) => handleUpdateWeddingInfo({ resepsi_venue_address: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                            placeholder="Full address"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-slate-600">Google Maps URL</label>
                          {weddingInfo.resepsi_maps_url && (
                            <button
                              onClick={() => window.open(weddingInfo.resepsi_maps_url, '_blank')}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              📍 Test
                            </button>
                          )}
                        </div>
                        <input
                          type="url"
                          value={weddingInfo.resepsi_maps_url}
                          onChange={(e) => handleUpdateWeddingInfo({ resepsi_maps_url: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                          placeholder="https://www.google.com/maps/embed?pb=..."
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Gunakan Google Maps embed URL (Share → Embed → Copy HTML → ambil src URL)
                        </p>
                      </div>
                    </div>

                    {/* Maps Display Configuration */}
                    <div className="border-t border-slate-200 pt-6">
                      <h4 className="text-md font-medium text-slate-600 mb-3 flex items-center space-x-2">
                        <span>🗺️</span>
                        <span>Maps Display in Invitation</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="maps_display_option"
                            value="akad"
                            checked={weddingInfo.maps_display_option === 'akad'}
                            onChange={(e) => handleUpdateWeddingInfo({ maps_display_option: e.target.value as 'akad' | 'resepsi' | 'both' | 'none' })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-700">🕌 Akad Only</div>
                            <div className="text-xs text-slate-500">Show akad maps only</div>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="maps_display_option"
                            value="resepsi"
                            checked={weddingInfo.maps_display_option === 'resepsi'}
                            onChange={(e) => handleUpdateWeddingInfo({ maps_display_option: e.target.value as 'akad' | 'resepsi' | 'both' | 'none' })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-700">🎉 Resepsi Only</div>
                            <div className="text-xs text-slate-500">Show resepsi maps only</div>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="maps_display_option"
                            value="both"
                            checked={weddingInfo.maps_display_option === 'both'}
                            onChange={(e) => handleUpdateWeddingInfo({ maps_display_option: e.target.value as 'akad' | 'resepsi' | 'both' | 'none' })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-700">🗺️ Both Maps</div>
                            <div className="text-xs text-slate-500">Show both maps</div>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="maps_display_option"
                            value="none"
                            checked={weddingInfo.maps_display_option === 'none'}
                            onChange={(e) => handleUpdateWeddingInfo({ maps_display_option: e.target.value as 'akad' | 'resepsi' | 'both' | 'none' })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-700">🚫 No Maps</div>
                            <div className="text-xs text-slate-500">Don't show maps</div>
                          </div>
                        </label>
                      </div>

                      {/* Preview Section */}
                      <div className="bg-slate-50 rounded-xl p-4 mt-4">
                        <h5 className="text-sm font-medium text-slate-700 mb-3">📱 Preview in Invitation:</h5>
                        <div className="space-y-2">
                          {weddingInfo.maps_display_option === 'none' && (
                            <p className="text-sm text-slate-500 italic">No maps will be displayed in invitation</p>
                          )}
                          {weddingInfo.maps_display_option === 'akad' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">🗺️ Lihat Lokasi Akad</span>
                            </div>
                          )}
                          {weddingInfo.maps_display_option === 'resepsi' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-lg">🗺️ Lihat Lokasi Resepsi</span>
                            </div>
                          )}
                          {weddingInfo.maps_display_option === 'both' && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-lg">🗺️ Lihat Lokasi Akad</span>
                              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-lg">🗺️ Lihat Lokasi Resepsi</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bride Family Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-slate-200/50">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center space-x-2">
                    <span>👰‍♀️</span>
                    <span>Bride Family</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Child Order</label>
                      <input
                        type="text"
                        value={weddingInfo.bride_child_order}
                        onChange={(e) => handleUpdateWeddingInfo({ bride_child_order: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                        placeholder="Putri Kedua"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Father</label>
                      <input
                        type="text"
                        value={weddingInfo.bride_father}
                        onChange={(e) => handleUpdateWeddingInfo({ bride_father: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                        placeholder="Bapak [Name] (Alm)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Mother</label>
                      <input
                        type="text"
                        value={weddingInfo.bride_mother}
                        onChange={(e) => handleUpdateWeddingInfo({ bride_mother: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                        placeholder="Ibu [Name]"
                      />
                    </div>
                  </div>
                </div>

                {/* Groom Family Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-slate-200/50">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center space-x-2">
                    <span>🤵‍♂️</span>
                    <span>Groom Family</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Child Order</label>
                      <input
                        type="text"
                        value={weddingInfo.groom_child_order}
                        onChange={(e) => handleUpdateWeddingInfo({ groom_child_order: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                        placeholder="Putra Pertama"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Father</label>
                      <input
                        type="text"
                        value={weddingInfo.groom_father}
                        onChange={(e) => handleUpdateWeddingInfo({ groom_father: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                        placeholder="Bapak [Name]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Mother</label>
                      <input
                        type="text"
                        value={weddingInfo.groom_mother}
                        onChange={(e) => handleUpdateWeddingInfo({ groom_mother: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:bg-white transition-all duration-300 text-sm"
                        placeholder="Ibu [Name]"
                      />
                    </div>
                  </div>
                </div>


              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💍</span>
                </div>
                <p className="text-slate-500">Loading wedding information...</p>
              </div>
            )}
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
    </div>
  );
}
