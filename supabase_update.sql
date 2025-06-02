-- Update script for existing Supabase database
-- Run this if you already have tables and just need to add new features

-- 1. Add from_side column to existing guests table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guests' AND column_name = 'from_side') THEN
        ALTER TABLE guests ADD COLUMN from_side TEXT NOT NULL CHECK (from_side IN ('adel', 'eko')) DEFAULT 'adel';
        RAISE NOTICE 'Added from_side column to guests table';
    ELSE
        RAISE NOTICE 'from_side column already exists in guests table';
    END IF;
END $$;

-- 2. Create policies for guests table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'guests' AND policyname = 'Allow all operations on guests'
    ) THEN
        CREATE POLICY "Allow all operations on guests" ON guests FOR ALL USING (true);
        RAISE NOTICE 'Created policy for guests table';
    ELSE
        RAISE NOTICE 'Policy for guests table already exists';
    END IF;
END $$;

-- 3. Create policies for rsvps table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rsvps' AND policyname = 'Allow all operations on rsvps'
    ) THEN
        CREATE POLICY "Allow all operations on rsvps" ON rsvps FOR ALL USING (true);
        RAISE NOTICE 'Created policy for rsvps table';
    ELSE
        RAISE NOTICE 'Policy for rsvps table already exists';
    END IF;
END $$;

-- 4. Create or replace views for admin dashboard
CREATE OR REPLACE VIEW admin_guest_summary AS
SELECT 
    g.id,
    g.name,
    g.partner,
    g.phone,
    g.from_side,
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

-- 5. Create or replace view for RSVP statistics
CREATE OR REPLACE VIEW rsvp_statistics AS
SELECT 
    COUNT(*) as total_guests,
    COUNT(CASE WHEN attendance = 'hadir' THEN 1 END) as attending,
    COUNT(CASE WHEN attendance = 'tidak_hadir' THEN 1 END) as not_attending,
    SUM(CASE WHEN attendance = 'hadir' THEN guest_count ELSE 0 END) as total_attending_count
FROM rsvps;

-- 6. Grant permissions on new views
GRANT SELECT ON admin_guest_summary TO anon, authenticated;
GRANT SELECT ON rsvp_statistics TO anon, authenticated;

-- 7. Update existing guests to have from_side if they don't have it
UPDATE guests 
SET from_side = 'adel' 
WHERE from_side IS NULL;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Database update completed successfully!';
    RAISE NOTICE 'New features available:';
    RAISE NOTICE '- Guest categorization (Adel/Eko)';
    RAISE NOTICE '- Enhanced statistics dashboard';
    RAISE NOTICE '- Admin views for better reporting';
END $$;
