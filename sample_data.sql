-- Sample data for testing admin panel
-- Run this after setting up the database to see the admin panel in action

-- Clean up any test data first
DELETE FROM guests WHERE name IN ('Debug Test', 'Test User');
DELETE FROM rsvps WHERE guest_name IN ('Debug Test', 'Test User');

-- Insert sample guests for Adel's side
INSERT INTO guests (name, partner, phone, from_side, invitation_link, whatsapp_message) VALUES
(
    'Budi Santoso',
    'Siti Rahayu',
    '081234567890',
    'adel',
    'https://ngundang-psi.vercel.app/?to=Budi%20Santoso',
    'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i Budi Santoso beserta Siti Rahayu untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://ngundang-psi.vercel.app/?to=Budi%20Santoso

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
),
(
    'Ahmad Wijaya',
    'Dewi Sari',
    '081234567891',
    'adel',
    'https://ngundang-psi.vercel.app/?to=Ahmad%20Wijaya',
    'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i Ahmad Wijaya beserta Dewi Sari untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://ngundang-psi.vercel.app/?to=Ahmad%20Wijaya

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
),
(
    'Rina Kusuma',
    NULL,
    '081234567892',
    'adel',
    'https://ngundang-psi.vercel.app/?to=Rina%20Kusuma',
    'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i Rina Kusuma untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://ngundang-psi.vercel.app/?to=Rina%20Kusuma

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
);

-- Insert sample guests for Eko's side
INSERT INTO guests (name, partner, phone, from_side, invitation_link, whatsapp_message) VALUES
(
    'Joko Susilo',
    'Maya Indah',
    '081234567893',
    'eko',
    'https://ngundang-psi.vercel.app/?to=Joko%20Susilo',
    'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i Joko Susilo beserta Maya Indah untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://ngundang-psi.vercel.app/?to=Joko%20Susilo

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
),
(
    'Sari Melati',
    'Andi Pratama',
    '081234567894',
    'eko',
    'https://ngundang-psi.vercel.app/?to=Sari%20Melati',
    'Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i Sari Melati beserta Andi Pratama untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://ngundang-psi.vercel.app/?to=Sari%20Melati

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.'
);

-- Insert sample RSVPs
INSERT INTO rsvps (guest_name, attendance, guest_count, message) VALUES
(
    'Ahmad Wijaya',
    'hadir',
    2,
    'Selamat untuk Adelita dan Ansyah! Semoga pernikahan kalian diberkahi dan bahagia selalu. Kami akan hadir dengan senang hati.'
),
(
    'Rina Kusuma',
    'hadir',
    1,
    'Congratulations! Wishing you both a lifetime of love and happiness. Can''t wait to celebrate with you!'
),
(
    'Joko Susilo',
    'hadir',
    2,
    'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.'
),
(
    'Sari Melati',
    'tidak_hadir',
    2,
    'Maaf tidak bisa hadir karena ada acara keluarga. Tapi doa dan ucapan selamat selalu untuk kalian berdua!'
);

-- Show results
SELECT 'Sample data inserted successfully!' as message;
SELECT 
    from_side,
    COUNT(*) as guest_count
FROM guests 
GROUP BY from_side;

SELECT 
    attendance,
    COUNT(*) as rsvp_count,
    SUM(guest_count) as total_people
FROM rsvps 
GROUP BY attendance;
