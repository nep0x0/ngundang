# 📊 Template Excel untuk Generate Link Personal

## 🎯 Cara Menggunakan Excel untuk Membuat Link Massal

### **Step 1: Buat Tabel di Excel**

| A | B | C |
|---|---|---|
| **Nama Tamu** | **Link Personal** | **Link Pendek (Optional)** |
| Budi Santoso | =CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A2," ","%20")) | |
| Siti Rahayu | =CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A3," ","%20")) | |
| Keluarga Wijaya | =CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A4," ","%20")) | |

### **Step 2: Formula Excel**

#### **Formula Dasar:**
```excel
=CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(A2," ","%20"))
```

#### **Formula Advanced (dengan validasi):**
```excel
=IF(A2<>"",CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(TRIM(A2)," ","%20")),"")
```

### **Step 3: Copy Formula ke Semua Baris**
1. Klik cell B2 (yang berisi formula)
2. Copy (Ctrl+C)
3. Select range B3:B100 (atau sesuai jumlah tamu)
4. Paste (Ctrl+V)

## 📝 Template Siap Pakai

### **Contoh Data Tamu:**
```
Budi Santoso
Siti Rahayu
Keluarga Besar Wijaya
Pak Ahmad dan Bu Sari
Teman Kuliah
Rekan Kerja
Tetangga Sebelah
Keluarga Besar Jakarta
Sahabat SMA
Tim Futsal
```

### **Hasil Link yang Dihasilkan:**
```
https://yourwebsite.com/?to=Budi%20Santoso
https://yourwebsite.com/?to=Siti%20Rahayu
https://yourwebsite.com/?to=Keluarga%20Besar%20Wijaya
https://yourwebsite.com/?to=Pak%20Ahmad%20dan%20Bu%20Sari
https://yourwebsite.com/?to=Teman%20Kuliah
https://yourwebsite.com/?to=Rekan%20Kerja
https://yourwebsite.com/?to=Tetangga%20Sebelah
https://yourwebsite.com/?to=Keluarga%20Besar%20Jakarta
https://yourwebsite.com/?to=Sahabat%20SMA
https://yourwebsite.com/?to=Tim%20Futsal
```

## 📱 Template Pesan WhatsApp

### **Column D: Template Pesan**
```excel
=CONCATENATE("Assalamualaikum ",A2,",

Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di pernikahan kami:

👰🤵 Adelita & Ansyah
📅 Jumat, 19 Desember 2025
🏠 Kediaman Mempelai Wanita, Jambi

Silakan buka undangan digital kami:
",B2,"

Terima kasih atas doa dan kehadiran Anda 🙏

Salam hangat,
Adelita & Ansyah")
```

## 🔗 Integrasi dengan WhatsApp Business

### **Format untuk WhatsApp Business API:**
```
https://wa.me/6281234567890?text=ENCODED_MESSAGE
```

### **Cara Encode Pesan:**
1. Copy pesan dari Excel
2. Gunakan URL encoder online
3. Ganti spasi dengan %20
4. Ganti enter dengan %0A

## 🎨 Template Lengkap Excel

### **Struktur Tabel:**
| A | B | C | D | E |
|---|---|---|---|---|
| **Nama** | **Link Personal** | **Link Pendek** | **Pesan WhatsApp** | **Status Kirim** |

### **Formula untuk setiap kolom:**

#### **Column B (Link Personal):**
```excel
=IF(A2<>"",CONCATENATE("https://yourwebsite.com/?to=",SUBSTITUTE(TRIM(A2)," ","%20")),"")
```

#### **Column C (Link Pendek):**
Manual input setelah shorten di bit.ly

#### **Column D (Pesan WhatsApp):**
```excel
=IF(A2<>"",CONCATENATE("Assalamualaikum ",A2,", Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di pernikahan kami: 👰🤵 Adelita & Ansyah 📅 Jumat, 19 Desember 2025 🏠 Kediaman Mempelai Wanita, Jambi. Silakan buka undangan digital kami: ",B2," Terima kasih atas doa dan kehadiran Anda 🙏 Salam hangat, Adelita & Ansyah"),"")
```

#### **Column E (Status Kirim):**
Manual input: "Sudah Kirim" / "Belum Kirim"

## 📊 Tips Excel Advanced

### **1. Data Validation:**
- Buat dropdown untuk status kirim
- Validasi format nama

### **2. Conditional Formatting:**
- Warna hijau untuk "Sudah Kirim"
- Warna merah untuk "Belum Kirim"

### **3. Filter & Sort:**
- Filter berdasarkan status
- Sort berdasarkan nama

### **4. Backup:**
- Save as .xlsx dan .csv
- Backup di Google Drive

## 🚀 Workflow Recommended

1. **Buat daftar tamu** di Column A
2. **Generate link** dengan formula di Column B
3. **Shorten link** (optional) di Column C
4. **Buat pesan** dengan formula di Column D
5. **Kirim satu per satu** via WhatsApp
6. **Update status** di Column E
7. **Track progress** dengan filter

---

**💡 Pro Tip:** Simpan file Excel ini sebagai template untuk undangan lainnya di masa depan!
