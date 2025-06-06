-- Personalized Invitation System Update
-- Add invitation_code and rsvp_submitted fields to guests table
-- Update RSVP table to track invitation codes

-- Add new fields to guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS invitation_code TEXT UNIQUE;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS rsvp_submitted BOOLEAN DEFAULT FALSE;

-- Add invitation_code to rsvps table for tracking
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS invitation_code TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guests_invitation_code ON guests (invitation_code);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_code ON rsvps (invitation_code);

-- Function to generate 5-character invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code() RETURNS TEXT AS $$
DECLARE
    chars TEXT := '23456789abcdefghjkmnpqrstuvwxyz'; -- Exclude confusing characters
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..5 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique invitation code
CREATE OR REPLACE FUNCTION generate_unique_invitation_code() RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := generate_invitation_code();
        SELECT EXISTS(SELECT 1 FROM guests WHERE invitation_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Generate invitation codes for existing guests (if they don't have one)
UPDATE guests 
SET invitation_code = generate_unique_invitation_code()
WHERE invitation_code IS NULL;

-- Update invitation links to use new format
UPDATE guests 
SET invitation_link = 'https://ngundang-psi.vercel.app/' || invitation_code
WHERE invitation_code IS NOT NULL;

-- Update WhatsApp messages to use new links
UPDATE guests 
SET whatsapp_message = 'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i ' || name || 
    CASE WHEN partner IS NOT NULL THEN ' dan ' || partner ELSE '' END || 
    ' untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://ngundang-psi.vercel.app/' || invitation_code || '

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
WHERE invitation_code IS NOT NULL;

-- Add constraint to ensure invitation_code is always present for new records
ALTER TABLE guests ALTER COLUMN invitation_code SET NOT NULL;

-- Create trigger to auto-generate invitation code for new guests
CREATE OR REPLACE FUNCTION auto_generate_invitation_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invitation_code IS NULL THEN
        NEW.invitation_code := generate_unique_invitation_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_invitation_code
    BEFORE INSERT ON guests
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invitation_code();

-- Update RLS policies if needed (optional)
-- You may need to update your Row Level Security policies to include the new fields

COMMIT;

-- Verification queries (run these to check the update)
-- SELECT COUNT(*) as total_guests, COUNT(invitation_code) as guests_with_codes FROM guests;
-- SELECT invitation_code, name, invitation_link FROM guests LIMIT 5;
