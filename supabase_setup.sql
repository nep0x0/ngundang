-- Wedding Invitation Database Setup for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Add from_side column to existing guests table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'guests' AND column_name = 'from_side') THEN
        ALTER TABLE guests ADD COLUMN from_side TEXT NOT NULL CHECK (from_side IN ('adel', 'eko')) DEFAULT 'adel';
    END IF;
END $$;

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    partner TEXT,
    phone TEXT,
    from_side TEXT NOT NULL CHECK (from_side IN ('adel', 'eko')) DEFAULT 'adel',
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

-- Create policies for guests table (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'guests' AND policyname = 'Allow all operations on guests'
    ) THEN
        CREATE POLICY "Allow all operations on guests" ON guests FOR ALL USING (true);
    END IF;
END $$;

-- Create policies for rsvps table (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'rsvps' AND policyname = 'Allow all operations on rsvps'
    ) THEN
        CREATE POLICY "Allow all operations on rsvps" ON rsvps FOR ALL USING (true);
    END IF;
END $$;

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

-- Create monthly_budgets table
CREATE TABLE IF NOT EXISTS monthly_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    month_name TEXT NOT NULL,
    total_income DECIMAL(15,2) DEFAULT 0,
    total_expense DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month, year)
);

-- Create income_items table
CREATE TABLE IF NOT EXISTS income_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    monthly_budget_id UUID REFERENCES monthly_budgets(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('received', 'pending', 'planned')) DEFAULT 'planned',
    date_received DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense_items table
CREATE TABLE IF NOT EXISTS expense_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    monthly_budget_id UUID REFERENCES monthly_budgets(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_cost DECIMAL(15,2) NOT NULL,
    actual_cost DECIMAL(15,2),
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'planned')) DEFAULT 'planned',
    payment_date DATE,
    vendor TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_month_year ON monthly_budgets(month, year);
CREATE INDEX IF NOT EXISTS idx_income_items_monthly_budget ON income_items(monthly_budget_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_monthly_budget ON expense_items(monthly_budget_id);
CREATE INDEX IF NOT EXISTS idx_income_items_status ON income_items(status);
CREATE INDEX IF NOT EXISTS idx_expense_items_status ON expense_items(status);

-- Enable Row Level Security (RLS)
ALTER TABLE monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_budgets table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'monthly_budgets' AND policyname = 'Allow all operations on monthly_budgets'
    ) THEN
        CREATE POLICY "Allow all operations on monthly_budgets" ON monthly_budgets FOR ALL USING (true);
    END IF;
END $$;

-- Create policies for income_items table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'income_items' AND policyname = 'Allow all operations on income_items'
    ) THEN
        CREATE POLICY "Allow all operations on income_items" ON income_items FOR ALL USING (true);
    END IF;
END $$;

-- Create policies for expense_items table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'expense_items' AND policyname = 'Allow all operations on expense_items'
    ) THEN
        CREATE POLICY "Allow all operations on expense_items" ON expense_items FOR ALL USING (true);
    END IF;
END $$;

-- Create function to update updated_at timestamp for budget tables
CREATE OR REPLACE FUNCTION update_budget_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_monthly_budgets_updated_at
    BEFORE UPDATE ON monthly_budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_updated_at_column();

CREATE TRIGGER update_income_items_updated_at
    BEFORE UPDATE ON income_items
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at
    BEFORE UPDATE ON expense_items
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_updated_at_column();

-- Create wedding_info table for comprehensive wedding information
CREATE TABLE IF NOT EXISTS wedding_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Couple Information (Full names, nicknames, initials)
    bride_full_name TEXT NOT NULL DEFAULT 'Adelita Sari Kuswanto',
    bride_nickname TEXT NOT NULL DEFAULT 'Adelita',
    bride_initial TEXT NOT NULL DEFAULT 'A',
    groom_full_name TEXT NOT NULL DEFAULT 'Ansyah Eko Santoso',
    groom_nickname TEXT NOT NULL DEFAULT 'Ansyah',
    groom_initial TEXT NOT NULL DEFAULT 'A',

    -- Akad Event Details
    akad_date DATE NOT NULL DEFAULT '2025-02-15',
    akad_time TIME NOT NULL DEFAULT '08:00',
    akad_venue_name TEXT NOT NULL DEFAULT 'Masjid Al-Ikhlas',
    akad_venue_address TEXT NOT NULL DEFAULT 'Jl. Masjid No. 45, Jakarta Selatan',
    akad_maps_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637257!5m2!1sid!2sid',

    -- Resepsi Event Details
    resepsi_date DATE NOT NULL DEFAULT '2025-02-15',
    resepsi_time TIME NOT NULL DEFAULT '11:00',
    resepsi_venue_name TEXT NOT NULL DEFAULT 'Gedung Serbaguna',
    resepsi_venue_address TEXT NOT NULL DEFAULT 'Jl. Raya No. 123, Jakarta Selatan',
    resepsi_maps_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637258!5m2!1sid!2sid',

    -- Bride Family Information
    bride_father TEXT NOT NULL DEFAULT 'Bapak Andi Kuswanto (Alm)',
    bride_mother TEXT NOT NULL DEFAULT 'Ibu Yulita Anggraini',
    bride_child_order TEXT NOT NULL DEFAULT 'Putri Kedua',

    -- Groom Family Information
    groom_father TEXT NOT NULL DEFAULT 'Bapak Ahmad Santoso',
    groom_mother TEXT NOT NULL DEFAULT 'Ibu Siti Rahayu',
    groom_child_order TEXT NOT NULL DEFAULT 'Putra Pertama',

    -- Maps Configuration
    maps_display_option TEXT NOT NULL DEFAULT 'both', -- 'akad', 'resepsi', 'both', 'none'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default wedding info
INSERT INTO wedding_info (
    bride_full_name, bride_nickname, bride_initial,
    groom_full_name, groom_nickname, groom_initial,
    akad_date, akad_time, akad_venue_name, akad_venue_address, akad_maps_url,
    resepsi_date, resepsi_time, resepsi_venue_name, resepsi_venue_address, resepsi_maps_url,
    bride_father, bride_mother, bride_child_order,
    groom_father, groom_mother, groom_child_order,
    maps_display_option
) VALUES (
    'Adelita Sari Kuswanto', 'Adelita', 'A',
    'Ansyah Eko Santoso', 'Ansyah', 'A',
    '2025-02-15', '08:00', 'Masjid Al-Ikhlas', 'Jl. Masjid No. 45, Jakarta Selatan', 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637257!5m2!1sid!2sid',
    '2025-02-15', '11:00', 'Gedung Serbaguna', 'Jl. Raya No. 123, Jakarta Selatan', 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.2339995101497!2d103.61586317496634!3d-1.61471919837025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMzYnNTMuMCJTIDEwM8KwMzcnMDYuNCJF!5e0!3m2!1sid!2sid!4v1749149637258!5m2!1sid!2sid',
    'Bapak Andi Kuswanto (Alm)', 'Ibu Yulita Anggraini', 'Putri Kedua',
    'Bapak Ahmad Santoso', 'Ibu Siti Rahayu', 'Putra Pertama',
    'both'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE wedding_info ENABLE ROW LEVEL SECURITY;

-- Create policy for wedding_info table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'wedding_info' AND policyname = 'Allow all operations on wedding_info'
    ) THEN
        CREATE POLICY "Allow all operations on wedding_info" ON wedding_info FOR ALL USING (true);
    END IF;
END $$;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_wedding_info_updated_at
    BEFORE UPDATE ON wedding_info
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_updated_at_column();

-- Grant permissions (adjust as needed)
-- These are basic permissions - you might want to be more restrictive in production
GRANT ALL ON guests TO anon, authenticated;
GRANT ALL ON rsvps TO anon, authenticated;
GRANT ALL ON monthly_budgets TO anon, authenticated;
GRANT ALL ON income_items TO anon, authenticated;
GRANT ALL ON expense_items TO anon, authenticated;
GRANT ALL ON wedding_info TO anon, authenticated;
GRANT SELECT ON admin_guest_summary TO anon, authenticated;
GRANT SELECT ON rsvp_statistics TO anon, authenticated;
