-- Add invitation_type column to existing guests table
-- Run this SQL in your Supabase SQL Editor to add the new invitation type feature

-- Add invitation_type column to guests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'guests' AND column_name = 'invitation_type') THEN
        ALTER TABLE guests ADD COLUMN invitation_type TEXT NOT NULL CHECK (invitation_type IN ('digital', 'fisik')) DEFAULT 'digital';
        
        -- Update existing guests to have digital as default
        UPDATE guests SET invitation_type = 'digital' WHERE invitation_type IS NULL;
        
        RAISE NOTICE 'invitation_type column added successfully to guests table';
    ELSE
        RAISE NOTICE 'invitation_type column already exists in guests table';
    END IF;
END $$;

-- Create index for better performance on invitation_type queries
CREATE INDEX IF NOT EXISTS idx_guests_invitation_type ON guests(invitation_type);

-- Update the admin view to include invitation_type
CREATE OR REPLACE VIEW admin_guest_summary AS
SELECT 
    g.id,
    g.name,
    g.partner,
    g.phone,
    g.from_side,
    g.invitation_type,
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

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'guests' 
    AND column_name = 'invitation_type';
