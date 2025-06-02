# 📨 Panduan Undangan Personal - Adelita & Ansyah

## 🎯 Cara Membuat Link Personal untuk Setiap Tamu

Undangan ini sudah dilengkapi dengan fitur **URL Parameter** yang memungkinkan Anda membuat link personal untuk setiap tamu dengan nama mereka masing-masing.

## 🔗 Format Link Personal

### **Format Dasar:**
```
https://yourwebsite.com/?to=NAMA_TAMU
```

### **Contoh Link Personal:**
```
https://yourwebsite.com/?to=Budi%20Santoso
https://yourwebsite.com/?to=Siti%20Rahayu
https://yourwebsite.com/?to=Keluarga%20Besar%20Wijaya
https://yourwebsite.com/?to=Pak%20Ahmad%20dan%20Bu%20Sari
```

## 📝 Cara Membuat Link untuk Banyak Tamu

### **1. Manual (untuk tamu sedikit):**
- Ganti `NAMA_TAMU` dengan nama tamu yang diinginkan
- Spasi diganti dengan `%20`
- Contoh: "Budi Santoso" → "Budi%20Santoso"

### **2. Menggunakan Excel/Google Sheets (Recommended):**

#### **Template Excel:**
| A (Nama Tamu) | B (Link Personal) |
|---------------|-------------------|
| Budi Santoso | =CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A2," ","%20")) |
| Siti Rahayu | =CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A3," ","%20")) |
| Keluarga Wijaya | =CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A4," ","%20")) |

#### **Formula Excel:**
```excel
=CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A2," ","%20"))
```

## 🎨 Variasi Parameter yang Didukung

Website mendukung 3 format parameter:
- `?to=` (utama)
- `?nama=` (alternatif)
- `?guest=` (alternatif)

**Contoh:**
```
https://yourwebsite.com/?to=Budi%20Santoso
https://yourwebsite.com/?nama=Budi%20Santoso
https://yourwebsite.com/?guest=Budi%20Santoso
```

## 📱 Cara Kirim ke Tamu

### **1. WhatsApp (Recommended):**
```
Assalamualaikum Budi,

Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di pernikahan kami:

👰🤵 Adelita & Ansyah
📅 Jumat, 19 Desember 2025
🏠 Kediaman Mempelai Wanita, Jambi

Silakan buka undangan digital kami:
https://yourwebsite.com/?to=Budi%20Santoso

Terima kasih atas doa dan kehadiran Anda 🙏

Salam hangat,
Adelita & Ansyah
```

### **2. Email:**
Subject: Undangan Pernikahan Adelita & Ansyah - Khusus untuk [Nama Tamu]

### **3. SMS:**
Untuk undangan yang lebih singkat

## 🛠️ Tools Bantuan

### **1. URL Encoder Online:**
- Gunakan untuk convert nama dengan karakter khusus
- Search: "URL encoder online"

### **2. WhatsApp Business:**
- Bisa kirim pesan massal dengan template
- Ganti nama otomatis untuk setiap kontak

### **3. QR Code Generator:**
- Buat QR code untuk undangan fisik
- Tamu scan → langsung ke undangan personal

## ✅ Contoh Implementasi Lengkap

### **Daftar Tamu & Link:**
```
1. Budi Santoso → https://yourwebsite.com/?to=Budi%20Santoso
2. Siti Rahayu → https://yourwebsite.com/?to=Siti%20Rahayu
3. Keluarga Wijaya → https://yourwebsite.com/?to=Keluarga%20Besar%20Wijaya
4. Pak Ahmad & Bu Sari → https://yourwebsite.com/?to=Pak%20Ahmad%20dan%20Bu%20Sari
5. Teman Kuliah → https://yourwebsite.com/?to=Teman%20Kuliah
```

## 🎯 Tips & Best Practices

### **✅ DO:**
- Gunakan nama lengkap atau panggilan yang familiar
- Test link sebelum kirim
- Buat backup daftar link
- Gunakan URL shortener jika perlu (bit.ly, tinyurl)

### **❌ DON'T:**
- Jangan gunakan karakter khusus (<, >, &)
- Jangan lupa encode spasi menjadi %20
- Jangan kirim link yang sama ke tamu berbeda

## 🔧 Troubleshooting

### **Problem: Nama tidak muncul**
- Cek apakah parameter `?to=` ada di URL
- Pastikan nama sudah di-encode dengan benar

### **Problem: Karakter aneh di nama**
- Gunakan URL encoder online
- Hindari karakter khusus

### **Problem: Link terlalu panjang**
- Gunakan URL shortener
- Atau gunakan nama yang lebih pendek

## 📊 Tracking (Optional)

Jika ingin tracking siapa yang sudah buka undangan, bisa tambahkan:
- Google Analytics
- Facebook Pixel
- Custom tracking script

---

**🎉 Selamat! Undangan personal Anda siap untuk dibagikan!**

Jika ada pertanyaan atau butuh bantuan, silakan hubungi developer. 😊
