<div align="center">

  <img src="public/img/tpabaiturrahmanlogo.webp" alt="TPA Baiturrahman Logo" width="120" height="120">

  # TPA Baiturrahman

  **Aplikasi Gamifikasi Rutinitas Islami untuk Siswa TPA**

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
  [![Firebase](https://img.shields.io/badge/Firebase-9.0-orange?style=flat-square&logo=firebase)](https://firebase.google.com)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

</div>

---

## 📖 Tentang

TPA Baiturrahman adalah aplikasi web modern yang dirancang untuk menggamifikasikan rutinitas kegiatan islami siswa TPA. Aplikasi ini membantu siswa untuk:

- Melaporkan aktivitas harian seperti Shalat, Baca Quran, dan Amalan Baik
- Mengupload foto bukti aktivitas dengan sistem Base64 encoding
- Mengumpulkan bintang sebagai reward untuk setiap aktivitas
- Melihat leaderboard peringkat siswa
- Memantau progres hafalan Al-Quran dan Asmaul Husna

## ✨ Fitur Utama

### Untuk Siswa
- 📝 **Laporan Aktivitas**: Submit laporan Shalat, Baca Quran, dan Amalan Baik
- 📸 **Foto Bukti**: Upload foto bukti aktivitas (maksimal 500KB)
- ⭐ **Sistem Bintang**: Dapatkan bintang untuk setiap aktivitas yang disetujui
  - Aktivitas tanpa foto: 1 bintang
  - Aktivitas dengan foto: 1.5 bintang
- 📊 **Dashboard**: Pantau total bintang dan riwayat laporan
- 🏆 **Leaderboard**: Lihat peringkat di antara siswa lain
- ⚙️ **Pengaturan**: Ubah nama dengan sistem cooldown 14 hari

### Untuk Guru
- ✅ **Approval System**: Setujui atau tolak laporan siswa
- 📝 **Input Hafalan**: Catat hafalan Al-Quran dan Asmaul Husna siswa
  - Hafalan Al-Quran: 1-1.5 bintang (tergantung foto)
  - Asmaul Husna: 1 bintang per 10 nama
- 👥 **Manajemen Siswa**: Lihat daftar siswa dan progres mereka
- 📸 **Preview Foto**: Lihat foto bukti dengan lightbox modal

## 🛠️ Teknologi

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email/Password & Google OAuth)
- **Image Storage**: Base64 encoding (Firestore)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, atau bun

### Installation

1. Clone repository:
```bash
git clone https://github.com/Budibudian17/tpa-baiturrahman.git
cd tpa-baiturrahman
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```

4. Configure Firebase di `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run development server:
```bash
npm run dev
```

6. Buka [http://localhost:3000](http://localhost:3000) di browser

## 📁 Struktur Project

```
tpa-baiturrahman/
├── public/
│   ├── img/
│   │   └── tpabaiturrahmanlogo.webp
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── reports/
│   │   │   ├── memorizations/
│   │   │   └── users/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   └── ...
│   ├── components/
│   │   ├── ActivityForm.tsx
│   │   ├── MemorizationForm.tsx
│   │   ├── ReportsQueue.tsx
│   │   ├── Leaderboard.tsx
│   │   └── SettingsModal.tsx
│   └── lib/
│       ├── firebase.ts
│       └── firebase-admin.ts
└── README.md
```

## 🎯 Sistem Bintang

| Aktivitas | Tanpa Foto | Dengan Foto |
|-----------|------------|-------------|
| Shalat | 1 ⭐ | 1.5 ⭐ |
| Amalan Baik | 1 ⭐ | 1.5 ⭐ |
| Baca Quran | 1 ⭐ | 1.5 ⭐ |
| Hafalan Quran | 1 ⭐ | 1.5 ⭐ |
| Asmaul Husna | - | 1 ⭐ per 10 nama |

## 🔐 Authentication

Aplikasi mendukung dua metode login:
1. **Email & Password**: Registrasi dengan email dan password
2. **Google OAuth**: Login dengan akun Google

## 📝 Aturan Perubahan Nama

- User dapat mengubah nama sekali tanpa batasan
- Setelah perubahan pertama, harus menunggu 14 hari untuk perubahan berikutnya
- Berlaku untuk guru dan siswa

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com/new)
3. Setup environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Kontribusi

Kontribusi sangat diapresiasi! Silakan:
1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 License

Dibuat dengan ❤️ untuk TPA Baiturrahman

---

<div align="center">

  **Dibuat dengan ❤️ untuk TPA Baiturrahman**

  [⬆ Back to Top](#tpa-baiturrahman)

</div>

