import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjgdusfhpeqwuuhpxepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZ2R1c2ZocGVxd3V1aHB4ZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzY1NjcsImV4cCI6MjA2NDQ1MjU2N30.wu3wI8qS2OwKiBS9as50SFa2JqVHaKSfKpxC4_QxXVk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Generate 5-character invitation code (exclude confusing characters)
export function generateInvitationCode(): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'; // Exclude 0,o,1,l,i
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Check if invitation code is unique
async function isInvitationCodeUnique(code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('guests')
    .select('id')
    .eq('invitation_code', code)
    .single();

  // If no data found, code is unique
  return error?.code === 'PGRST116';
}

// Generate unique invitation code
export async function generateUniqueInvitationCode(): Promise<string> {
  let code: string;
  let isUnique = false;

  do {
    code = generateInvitationCode();
    isUnique = await isInvitationCodeUnique(code);
  } while (!isUnique);

  return code;
}

// Types for our database tables
export interface Guest {
  id: string
  name: string
  partner?: string
  phone?: string
  from_side: string // Changed from 'adel' | 'eko' to string for flexibility
  category?: string // New field for guest category (teman/keluarga/etc)
  invitation_code: string // 5-character unique code for personalized invitations
  invitation_link: string
  whatsapp_message: string
  rsvp_submitted: boolean // Track if guest has submitted RSVP
  created_at: string
  updated_at: string
}

export interface RSVP {
  id: string
  guest_id?: string
  guest_name: string
  attendance: 'hadir' | 'tidak_hadir'
  guest_count: number
  message?: string
  invitation_code?: string
  created_at: string
}

// Database functions
export const guestService = {
  // Get all guests
  async getAll(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Add new guest
  async create(guest: Omit<Guest, 'id' | 'invitation_code' | 'invitation_link' | 'whatsapp_message' | 'rsvp_submitted' | 'created_at' | 'updated_at'>, baseUrl: string = 'https://ngundang-psi.vercel.app'): Promise<Guest> {
    // Generate unique invitation code
    const invitationCode = await generateUniqueInvitationCode();

    // Generate invitation link and WhatsApp message
    const invitationLink = generateInvitationLink(invitationCode, baseUrl);
    const whatsappMessage = generateWhatsAppMessage(guest.name, guest.partner, invitationCode, baseUrl);

    const guestWithCode = {
      ...guest,
      invitation_code: invitationCode,
      invitation_link: invitationLink,
      whatsapp_message: whatsappMessage,
      rsvp_submitted: false
    };

    const { data, error } = await supabase
      .from('guests')
      .insert([guestWithCode])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update guest
  async update(id: string, updates: Partial<Guest>): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete guest
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get unique from_side values for suggestions
  async getFromSideOptions(): Promise<{ value: string; count: number }[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('from_side')

    if (error) throw error

    // Count occurrences of each from_side value
    const counts: { [key: string]: number } = {}
    data?.forEach(guest => {
      const normalized = guest.from_side.toLowerCase().trim()
      counts[normalized] = (counts[normalized] || 0) + 1
    })

    // Convert to array and sort by count (descending)
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  },

  // Get unique category values for suggestions
  async getCategoryOptions(): Promise<{ value: string; count: number }[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('category')

    if (error) throw error

    // Count occurrences of each category value
    const counts: { [key: string]: number } = {}
    data?.forEach(guest => {
      if (guest.category) {
        const normalized = guest.category.toLowerCase().trim()
        counts[normalized] = (counts[normalized] || 0) + 1
      }
    })

    // Convert to array and sort by count (descending)
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  },

  // Get guest by invitation code
  async getByInvitationCode(code: string): Promise<Guest | null> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('invitation_code', code)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

export const rsvpService = {
  // Get all RSVPs
  async getAll(): Promise<RSVP[]> {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Add new RSVP
  async create(rsvp: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP> {
    const { data, error } = await supabase
      .from('rsvps')
      .insert([rsvp])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Check if guest already submitted RSVP
  async checkExisting(guestName: string): Promise<RSVP | null> {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('guest_name', guestName)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Delete individual RSVP
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Delete all RSVPs
  async deleteAll(): Promise<void> {
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (error) throw error
  }
}

// Statistics service
export const statsService = {
  // Get comprehensive statistics
  async getDetailedStats() {
    // Get all guests with categories
    const { data: guests, error: guestError } = await supabase
      .from('guests')
      .select('name, from_side, category, created_at')

    if (guestError) throw guestError

    // Get all RSVPs
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('attendance, guest_count, guest_name, created_at')

    if (rsvpError) throw rsvpError

    // Basic guest statistics
    const totalGuests = guests?.length || 0
    const adelGuests = guests?.filter(g => g.from_side?.toLowerCase() === 'adel').length || 0
    const ekoGuests = guests?.filter(g => g.from_side?.toLowerCase() === 'eko').length || 0
    const otherGuests = totalGuests - adelGuests - ekoGuests

    // From side distribution
    const fromSideStats: { [key: string]: number } = {}
    guests?.forEach(guest => {
      const fromSide = guest.from_side?.toLowerCase() || 'unknown'
      fromSideStats[fromSide] = (fromSideStats[fromSide] || 0) + 1
    })

    // Category distribution
    const categoryStats: { [key: string]: number } = {}
    guests?.forEach(guest => {
      if (guest.category) {
        const category = guest.category.toLowerCase()
        categoryStats[category] = (categoryStats[category] || 0) + 1
      }
    })

    // RSVP statistics
    const totalRSVPs = rsvps?.length || 0
    const attending = rsvps?.filter(r => r.attendance === 'hadir').length || 0
    const notAttending = rsvps?.filter(r => r.attendance === 'tidak_hadir').length || 0
    const totalAttendingCount = rsvps?.filter(r => r.attendance === 'hadir')
      .reduce((sum, r) => sum + (r.guest_count || 1), 0) || 0
    const totalNotAttendingCount = rsvps?.filter(r => r.attendance === 'tidak_hadir')
      .reduce((sum, r) => sum + (r.guest_count || 1), 0) || 0

    // Response rates
    const responseRate = totalGuests > 0 ? Math.round((totalRSVPs / totalGuests) * 100) : 0
    const attendanceRate = totalRSVPs > 0 ? Math.round((attending / totalRSVPs) * 100) : 0

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentGuests = guests?.filter(g => new Date(g.created_at) >= sevenDaysAgo).length || 0
    const recentRSVPs = rsvps?.filter(r => new Date(r.created_at) >= sevenDaysAgo).length || 0

    // RSVP by from_side
    const rsvpByFromSide: { [key: string]: { attending: number; notAttending: number; total: number } } = {}

    // Initialize with guest from_side data
    Object.keys(fromSideStats).forEach(fromSide => {
      rsvpByFromSide[fromSide] = { attending: 0, notAttending: 0, total: 0 }
    })

    // Count RSVPs by matching guest names
    rsvps?.forEach(rsvp => {
      const guest = guests?.find(g => g.name === rsvp.guest_name)
      if (guest) {
        const fromSide = guest.from_side?.toLowerCase() || 'unknown'
        if (!rsvpByFromSide[fromSide]) {
          rsvpByFromSide[fromSide] = { attending: 0, notAttending: 0, total: 0 }
        }

        rsvpByFromSide[fromSide].total += 1
        if (rsvp.attendance === 'hadir') {
          rsvpByFromSide[fromSide].attending += 1
        } else {
          rsvpByFromSide[fromSide].notAttending += 1
        }
      }
    })

    return {
      // Basic stats
      totalGuests,
      adelGuests,
      ekoGuests,
      otherGuests,
      totalRSVPs,
      attending,
      notAttending,
      totalAttendingCount,
      totalNotAttendingCount,
      responseRate,
      attendanceRate,

      // Detailed breakdowns
      fromSideStats,
      categoryStats,
      rsvpByFromSide,

      // Recent activity
      recentGuests,
      recentRSVPs,

      // Calculated metrics
      pendingInvitations: totalGuests - totalRSVPs,
      averageGuestPerRSVP: totalRSVPs > 0 ? Math.round((totalAttendingCount + totalNotAttendingCount) / totalRSVPs * 10) / 10 : 0
    }
  },

  // Legacy function for backward compatibility
  async getGuestStats() {
    const detailedStats = await this.getDetailedStats()
    return {
      totalGuests: detailedStats.totalGuests,
      adelGuests: detailedStats.adelGuests,
      ekoGuests: detailedStats.ekoGuests,
      totalRSVPs: detailedStats.totalRSVPs,
      attending: detailedStats.attending,
      notAttending: detailedStats.notAttending,
      totalAttendingCount: detailedStats.totalAttendingCount,
      responseRate: detailedStats.responseRate
    }
  }
}

// Budget Types
export interface MonthlyBudget {
  id: string
  month: number
  year: number
  month_name: string
  total_income: number
  total_expense: number
  balance: number
  created_at: string
  updated_at: string
}

export interface IncomeItem {
  id: string
  monthly_budget_id: string
  source: string
  amount: number
  status: 'received' | 'pending' | 'planned'
  date_received?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ExpenseItem {
  id: string
  monthly_budget_id: string
  item_name: string
  category: string
  estimated_cost: number
  actual_cost?: number
  status: 'paid' | 'pending' | 'planned'
  payment_date?: string
  vendor?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Wedding Info Types
export interface WeddingInfo {
  id: string

  // Couple Information
  bride_full_name: string
  bride_nickname: string
  bride_initial: string
  groom_full_name: string
  groom_nickname: string
  groom_initial: string

  // Akad Event Details
  akad_date: string
  akad_time: string
  akad_venue_name: string
  akad_venue_address: string
  akad_maps_url: string

  // Resepsi Event Details
  resepsi_date: string
  resepsi_time: string
  resepsi_venue_name: string
  resepsi_venue_address: string
  resepsi_maps_url: string

  // Bride Family Information
  bride_father: string
  bride_mother: string
  bride_child_order: string

  // Groom Family Information
  groom_father: string
  groom_mother: string
  groom_child_order: string

  // Maps Configuration
  maps_display_option: 'akad' | 'resepsi' | 'both' | 'none'

  created_at: string
  updated_at: string
}

// Budget Services
export const budgetService = {
  // Get all monthly budgets with their items
  async getAllMonthlyBudgets(): Promise<(MonthlyBudget & { income_items: IncomeItem[], expense_items: ExpenseItem[] })[]> {
    const { data: budgets, error: budgetError } = await supabase
      .from('monthly_budgets')
      .select('*')
      .order('year', { ascending: true })
      .order('month', { ascending: true })

    if (budgetError) throw budgetError

    const budgetsWithItems = await Promise.all(
      (budgets || []).map(async (budget) => {
        const [incomeResult, expenseResult] = await Promise.all([
          supabase.from('income_items').select('*').eq('monthly_budget_id', budget.id),
          supabase.from('expense_items').select('*').eq('monthly_budget_id', budget.id)
        ])

        return {
          ...budget,
          income_items: incomeResult.data || [],
          expense_items: expenseResult.data || []
        }
      })
    )

    return budgetsWithItems
  },

  // Create new monthly budget
  async createMonthlyBudget(budget: Omit<MonthlyBudget, 'id' | 'created_at' | 'updated_at'>): Promise<MonthlyBudget> {
    const { data, error } = await supabase
      .from('monthly_budgets')
      .insert([budget])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Add income item
  async addIncomeItem(income: Omit<IncomeItem, 'id' | 'created_at' | 'updated_at'>): Promise<IncomeItem> {
    const { data, error } = await supabase
      .from('income_items')
      .insert([income])
      .select()
      .single()

    if (error) throw error

    // Update monthly budget totals
    await this.updateBudgetTotals(income.monthly_budget_id)

    return data
  },

  // Add expense item
  async addExpenseItem(expense: Omit<ExpenseItem, 'id' | 'created_at' | 'updated_at'>): Promise<ExpenseItem> {
    const { data, error } = await supabase
      .from('expense_items')
      .insert([expense])
      .select()
      .single()

    if (error) throw error

    // Update monthly budget totals
    await this.updateBudgetTotals(expense.monthly_budget_id)

    return data
  },

  // Update budget totals
  async updateBudgetTotals(monthlyBudgetId: string) {
    const [incomeResult, expenseResult] = await Promise.all([
      supabase.from('income_items').select('amount').eq('monthly_budget_id', monthlyBudgetId),
      supabase.from('expense_items').select('estimated_cost').eq('monthly_budget_id', monthlyBudgetId)
    ])

    const totalIncome = (incomeResult.data || []).reduce((sum, item) => sum + item.amount, 0)
    const totalExpense = (expenseResult.data || []).reduce((sum, item) => sum + item.estimated_cost, 0)
    const balance = totalIncome - totalExpense

    const { error } = await supabase
      .from('monthly_budgets')
      .update({
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance
      })
      .eq('id', monthlyBudgetId)

    if (error) throw error
  },

  // Delete income item
  async deleteIncomeItem(id: string, monthlyBudgetId: string) {
    const { error } = await supabase
      .from('income_items')
      .delete()
      .eq('id', id)

    if (error) throw error
    await this.updateBudgetTotals(monthlyBudgetId)
  },

  // Delete expense item
  async deleteExpenseItem(id: string, monthlyBudgetId: string) {
    const { error } = await supabase
      .from('expense_items')
      .delete()
      .eq('id', id)

    if (error) throw error
    await this.updateBudgetTotals(monthlyBudgetId)
  },

  // Delete monthly budget (will cascade delete all income and expense items)
  async deleteMonthlyBudget(id: string) {
    const { error } = await supabase
      .from('monthly_budgets')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Get monthly budget with item counts for confirmation
  async getMonthlyBudgetWithCounts(id: string) {
    const [budgetResult, incomeResult, expenseResult] = await Promise.all([
      supabase.from('monthly_budgets').select('*').eq('id', id).single(),
      supabase.from('income_items').select('id').eq('monthly_budget_id', id),
      supabase.from('expense_items').select('id').eq('monthly_budget_id', id)
    ])

    if (budgetResult.error) throw budgetResult.error

    return {
      budget: budgetResult.data,
      incomeCount: incomeResult.data?.length || 0,
      expenseCount: expenseResult.data?.length || 0,
      totalItems: (incomeResult.data?.length || 0) + (expenseResult.data?.length || 0)
    }
  }
}

// Wedding Info Services
export const weddingInfoService = {
  // Get wedding info (should only be one record)
  async getWeddingInfo(): Promise<WeddingInfo> {
    const { data, error } = await supabase
      .from('wedding_info')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error fetching wedding info:', error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error('No wedding info found')
    }

    return data[0]
  },

  // Update wedding info
  async updateWeddingInfo(weddingInfo: Partial<WeddingInfo>): Promise<WeddingInfo> {
    // First get the existing record ID
    const existing = await this.getWeddingInfo()

    const { data, error } = await supabase
      .from('wedding_info')
      .update(weddingInfo)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating wedding info:', error)
      throw error
    }

    return data
  },

  // Create wedding info if doesn't exist
  async createWeddingInfo(weddingInfo: Omit<WeddingInfo, 'id' | 'created_at' | 'updated_at'>): Promise<WeddingInfo> {
    const { data, error } = await supabase
      .from('wedding_info')
      .insert([weddingInfo])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Helper function to generate invitation link using invitation code
export function generateInvitationLink(invitationCode: string, baseUrl: string = 'https://ngundang-psi.vercel.app'): string {
  return `${baseUrl}/${invitationCode}`
}

// Legacy function for backward compatibility (will be updated to use invitation codes)
export function generateInvitationLinkLegacy(guestName: string, partnerName?: string, baseUrl: string = 'https://yourwebsite.com'): string {
  const fullName = partnerName ? `${guestName} dan ${partnerName}` : guestName
  const encodedName = encodeURIComponent(fullName)
  return `${baseUrl}/?to=${encodedName}`
}

// Helper function to generate WhatsApp message with invitation code
export function generateWhatsAppMessage(guestName: string, partnerName?: string, invitationCode?: string, baseUrl: string = 'https://ngundang-psi.vercel.app'): string {
  const partner = partnerName ? ` dan ${partnerName}` : ''
  const link = invitationCode ? generateInvitationLink(invitationCode, baseUrl) : `${baseUrl}`

  return `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i ${guestName}${partner} untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

${link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.`
}
