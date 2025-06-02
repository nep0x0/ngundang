-- Wedding Invitation Database Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    partner TEXT,
    phone TEXT,
    invitation_link TEXT NOT NULL,
    whatsapp_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rsvps table
CREATE TABLE IF NOT EXISTS rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
    guest_name TEXT NOT NULL,
    attendance TEXT NOT NULL CHECK (attendance IN ('hadir', 'tidak_hadir')),
    guest_count INTEGER DEFAULT 1,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_created_at ON guests(created_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest_name ON rsvps(guest_name);
CREATE INDEX IF NOT EXISTS idx_rsvps_attendance ON rsvps(attendance);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for guests table
-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on guests" ON guests
    FOR ALL USING (true);

-- Create policies for rsvps table
-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on rsvps" ON rsvps
    FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_guests_updated_at 
    BEFORE UPDATE ON guests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove if not needed)
INSERT INTO guests (name, partner, phone, invitation_link, whatsapp_message) VALUES
(
    'Budi Santoso',
    'Siti Rahayu',
    '081234567890',
    'https://yourwebsite.com/?to=Budi%20Santoso',
    'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i Budi Santoso beserta Siti Rahayu untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://yourwebsite.com/?to=Budi%20Santoso

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
);

-- Insert sample RSVP (optional - remove if not needed)
INSERT INTO rsvps (guest_name, attendance, guest_count, message) VALUES
(
    'Ahmad Wijaya',
    'hadir',
    2,
    'Selamat untuk Adelita dan Ansyah! Semoga pernikahan kalian diberkahi dan bahagia selalu.'
),
(
    'Sari Indah',
    'hadir',
    1,
    'Congratulations! Wishing you both a lifetime of love and happiness.'
);

-- Create view for admin dashboard (optional)
CREATE OR REPLACE VIEW admin_guest_summary AS
SELECT 
    g.id,
    g.name,
    g.partner,
    g.phone,
    g.created_at,
    CASE 
        WHEN r.id IS NOT NULL THEN r.attendance
        ELSE 'belum_konfirmasi'
    END as rsvp_status,
    r.guest_count,
    r.message as rsvp_message,
    r.created_at as rsvp_date
FROM guests g
LEFT JOIN rsvps r ON g.name = r.guest_name
ORDER BY g.created_at DESC;

-- Create view for RSVP statistics (optional)
CREATE OR REPLACE VIEW rsvp_statistics AS
SELECT 
    COUNT(*) as total_guests,
    COUNT(CASE WHEN attendance = 'hadir' THEN 1 END) as attending,
    COUNT(CASE WHEN attendance = 'tidak_hadir' THEN 1 END) as not_attending,
    SUM(CASE WHEN attendance = 'hadir' THEN guest_count ELSE 0 END) as total_attending_count
FROM rsvps;

-- Grant permissions (adjust as needed)
-- These are basic permissions - you might want to be more restrictive in production
GRANT ALL ON guests TO anon, authenticated;
GRANT ALL ON rsvps TO anon, authenticated;
GRANT SELECT ON admin_guest_summary TO anon, authenticated;
GRANT SELECT ON rsvp_statistics TO anon, authenticated;
