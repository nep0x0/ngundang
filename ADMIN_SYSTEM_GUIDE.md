# 🔧 Admin System Guide - Wedding Invitation

## 🎯 Overview

Sistem admin telah diimplementasikan dengan fitur lengkap untuk mengelola undangan pernikahan Adelita & Ansyah, termasuk:

1. **Guest Management** - Tambah, edit, hapus tamu
2. **WhatsApp Message Generator** - Template pesan otomatis
3. **RSVP Tracking** - Lihat siapa yang sudah konfirmasi
4. **Chat-like RSVP Display** - Tampilan seperti chat di undangan

## 🗄️ Database Setup (Supabase)

### **Step 1: Setup Database**
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka project Anda
3. Go to **SQL Editor**
4. Copy-paste isi file `supabase_setup.sql`
5. Run SQL script

### **Step 2: Verify Tables**
Pastikan tables berikut sudah terbuat:
- `guests` - Data tamu undangan
- `rsvps` - Konfirmasi kehadiran
- Views untuk admin dashboard

## 🚀 Cara Menggunakan Admin Panel

### **Akses Admin Panel**
```
https://yourwebsite.com/admin
```

### **Tab 1: Manage Guests**

#### **Add New Guest:**
1. Isi form:
   - **Nama Tamu** (required): "Budi Santoso"
   - **Pasangan** (optional): "Siti Rahayu"
   - **Phone** (optional): "081234567890"
2. Klik **Add Guest**
3. System otomatis generate:
   - Link personal undangan
   - Template pesan WhatsApp

#### **Guest Actions:**
- **Copy Link**: Copy link undangan personal
- **Copy Message**: Copy template pesan WhatsApp
- **Delete**: Hapus tamu dari database

### **Tab 2: View RSVPs**
Melihat semua konfirmasi kehadiran:
- Nama tamu
- Status kehadiran (Hadir/Tidak Hadir)
- Jumlah tamu
- Pesan/ucapan
- Tanggal konfirmasi

## 📱 Template Pesan WhatsApp

### **Format Otomatis:**
```
Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i [NAMA TAMU] beserta [PASANGAN] untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

[LINK PERSONAL]

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.
```

### **Contoh Real:**
```
Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i Budi Santoso beserta Siti Rahayu untuk menghadiri acara kami.

*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :

https://yourwebsite.com/?to=Budi%20Santoso

Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.

*Mohon maaf perihal undangan hanya di bagikan melalui pesan ini.*

Diharapkan untuk *tetap menjaga kesehatan bersama dan datang pada jam yang telah ditentukan.*

Terima kasih banyak atas perhatiannya.
```

## 💬 RSVP Features

### **Chat-like Display di Undangan:**
- Tampil di atas form RSVP
- Hanya menampilkan tamu yang **akan hadir**
- Format seperti chat dengan avatar dan bubble
- Real-time update saat ada RSVP baru

### **RSVP Form Behavior:**
1. **Jika tamu belum RSVP**: Tampil form konfirmasi
2. **Jika sudah RSVP**: Form hilang, tampil thank you message
3. **Auto-fill nama**: Dari URL parameter
4. **Prevent duplicate**: Cek existing RSVP berdasarkan nama

### **RSVP Data Collected:**
- Nama tamu
- Status kehadiran (Hadir/Tidak Hadir)
- Jumlah tamu (jika hadir)
- Pesan/ucapan (optional)

## 🔧 Technical Implementation

### **Database Schema:**

#### **guests table:**
```sql
- id (UUID, Primary Key)
- name (TEXT, Required)
- partner (TEXT, Optional)
- phone (TEXT, Optional)
- invitation_link (TEXT, Generated)
- whatsapp_message (TEXT, Generated)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **rsvps table:**
```sql
- id (UUID, Primary Key)
- guest_id (UUID, Foreign Key to guests)
- guest_name (TEXT, Required)
- attendance ('hadir' | 'tidak_hadir')
- guest_count (INTEGER)
- message (TEXT, Optional)
- created_at (TIMESTAMP)
```

### **API Functions:**
- `guestService.getAll()` - Get all guests
- `guestService.create()` - Add new guest
- `guestService.update()` - Update guest
- `guestService.delete()` - Delete guest
- `rsvpService.getAll()` - Get all RSVPs
- `rsvpService.create()` - Submit RSVP
- `rsvpService.checkExisting()` - Check if guest already RSVP'd

## 📊 Workflow Recommended

### **1. Setup Phase:**
1. Run SQL setup di Supabase
2. Test admin panel access
3. Add beberapa tamu sample

### **2. Guest Management:**
1. Input semua tamu via admin panel
2. Copy template pesan untuk setiap tamu
3. Kirim via WhatsApp satu per satu

### **3. RSVP Tracking:**
1. Monitor RSVP responses di admin panel
2. Follow up tamu yang belum konfirmasi
3. Update planning berdasarkan jumlah yang hadir

### **4. Day of Event:**
1. Print guest list dari admin panel
2. Use RSVP data for seating arrangement
3. Final headcount for catering

## 🛡️ Security Notes

### **Current Setup:**
- RLS (Row Level Security) enabled
- Basic policies allow all operations
- No authentication required for demo

### **Production Recommendations:**
1. **Add Authentication**: Protect admin panel with login
2. **Restrict Policies**: Limit database access
3. **Environment Variables**: Move Supabase keys to .env
4. **Rate Limiting**: Prevent spam submissions

## 🚨 Troubleshooting

### **Common Issues:**

#### **Database Connection Error:**
- Check Supabase URL and API key
- Verify tables exist in database
- Check network connection

#### **RSVP Not Saving:**
- Check browser console for errors
- Verify form validation
- Check Supabase policies

#### **Admin Panel Not Loading:**
- Check if `/admin` route exists
- Verify component imports
- Check for JavaScript errors

#### **WhatsApp Message Not Generated:**
- Check template function
- Verify guest data is complete
- Check URL encoding

## 📈 Analytics & Insights

### **Available Data:**
- Total guests invited
- RSVP response rate
- Attendance vs non-attendance
- Total expected attendees
- Popular messages/wishes

### **Export Options:**
- Guest list (CSV/Excel)
- RSVP responses
- Attendance summary
- Contact list for follow-up

---

**🎉 Admin system siap digunakan! Semoga pernikahan Adelita & Ansyah berjalan lancar!**
