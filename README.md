# EazyFit Trainer (React Native + Expo)

Aplikasi Android untuk personal trainer EazyFit. Memakai API `eazyfit-trainer-api` (Laravel).

## Menjalankan
1. `cp .env.example .env` lalu isi `EXPO_PUBLIC_API_URL=https://domain-anda.com/api` (tanpa `/` di akhir).
2. `npm install`
3. `npx expo start` — buka dengan Expo Go (Android), atau `npx expo start --android`.

## Membuat APK
```
npm i -g eas-cli
eas login
eas build -p android --profile preview      # APK untuk dibagikan
eas build -p android --profile production   # AAB untuk Play Store
```
Ubah `android.package` di `app.json` jika ingin ID aplikasi lain.

## Struktur
- `src/services` — Axios + semua endpoint trainer
- `src/store` — Redux Toolkit (auth, dashboard, students)
- `src/navigation` — React Navigation (stack + bottom tabs)
- `src/screens` — Login, Home, Calendar, Students, Sessions, Settings, detail/form
- `src/components` — komponen UI bersama
- `src/utils/format.ts` — format tanggal/jam/rupiah (tanpa konversi zona waktu)

## Catatan
- Token login disimpan di AsyncStorage; respons 401 otomatis logout.
- Tanggal dikirim sebagai teks lokal (`YYYY-MM-DD`, `HH:mm`).
- Pemilih tanggal/jam memakai API Android (`DateTimePickerAndroid`); versi iOS belum disiapkan.
