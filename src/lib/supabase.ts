import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kjgdusfhpeqwuuhpxepc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZ2R1c2ZocGVxd3V1aHB4ZXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzY1NjcsImV4cCI6MjA2NDQ1MjU2N30.wu3wI8qS2OwKiBS9as50SFa2JqVHaKSfKpxC4_QxXVk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Guest {
  id: string
  name: string
  partner?: string
  phone?: string
  from_side: 'adel' | 'eko'
  invitation_link: string
  whatsapp_message: string
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
  async create(guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .insert([guest])
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
  }
}

// Statistics service
export const statsService = {
  // Get guest statistics
  async getGuestStats() {
    const { data: guests, error: guestError } = await supabase
      .from('guests')
      .select('from_side')

    if (guestError) throw guestError

    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('attendance, guest_count')

    if (rsvpError) throw rsvpError

    const totalGuests = guests?.length || 0
    const adelGuests = guests?.filter(g => g.from_side === 'adel').length || 0
    const ekoGuests = guests?.filter(g => g.from_side === 'eko').length || 0

    const totalRSVPs = rsvps?.length || 0
    const attending = rsvps?.filter(r => r.attendance === 'hadir').length || 0
    const notAttending = rsvps?.filter(r => r.attendance === 'tidak_hadir').length || 0
    const totalAttendingCount = rsvps?.filter(r => r.attendance === 'hadir')
      .reduce((sum, r) => sum + (r.guest_count || 1), 0) || 0

    return {
      totalGuests,
      adelGuests,
      ekoGuests,
      totalRSVPs,
      attending,
      notAttending,
      totalAttendingCount,
      responseRate: totalGuests > 0 ? Math.round((totalRSVPs / totalGuests) * 100) : 0
    }
  }
}

// Helper function to generate invitation link
export function generateInvitationLink(guestName: string, baseUrl: string = 'https://yourwebsite.com'): string {
  const encodedName = encodeURIComponent(guestName)
  return `${baseUrl}/?to=${encodedName}`
}

// Helper function to generate WhatsApp message
export function generateWhatsAppMessage(guestName: string, partnerName?: string, invitationLink?: string): string {
  const partner = partnerName ? ` beserta ${partnerName}` : ''
  const link = invitationLink || generateInvitationLink(guestName)
  
  return `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i ${guestName}${partner} untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

${link}

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.`
}
