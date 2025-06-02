-- Update existing guest links to include partner names
-- Run this in Supabase SQL Editor to fix existing data

-- First, let's see current data
SELECT 
    name, 
    partner, 
    invitation_link,
    CASE 
        WHEN partner IS NOT NULL AND partner != '' 
        THEN CONCAT('https://ngundang-psi.vercel.app/?to=', REPLACE(REPLACE(name || ' dan ' || partner, ' ', '%20'), '&', '%26'))
        ELSE CONCAT('https://ngundang-psi.vercel.app/?to=', REPLACE(REPLACE(name, ' ', '%20'), '&', '%26'))
    END as new_invitation_link
FROM guests
ORDER BY created_at DESC;

-- Update invitation links to include partner names
UPDATE guests 
SET invitation_link = CASE 
    WHEN partner IS NOT NULL AND partner != '' 
    THEN CONCAT('https://ngundang-psi.vercel.app/?to=', REPLACE(REPLACE(name || ' dan ' || partner, ' ', '%20'), '&', '%26'))
    ELSE CONCAT('https://ngundang-psi.vercel.app/?to=', REPLACE(REPLACE(name, ' ', '%20'), '&', '%26'))
END;

-- Update WhatsApp messages to include partner names in links
UPDATE guests 
SET whatsapp_message = CONCAT(
    'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i ', 
    name,
    CASE 
        WHEN partner IS NOT NULL AND partner != '' 
        THEN CONCAT(' dan ', partner)
        ELSE ''
    END,
    ' untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

',
    invitation_link,
    '

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
);

-- Verify the updates
SELECT 
    name, 
    partner, 
    invitation_link,
    LEFT(whatsapp_message, 200) as message_preview
FROM guests
ORDER BY created_at DESC;

-- Show summary
SELECT 
    'Update completed!' as status,
    COUNT(*) as total_guests_updated,
    COUNT(CASE WHEN partner IS NOT NULL AND partner != '' THEN 1 END) as guests_with_partners,
    COUNT(CASE WHEN partner IS NULL OR partner = '' THEN 1 END) as guests_without_partners
FROM guests;
