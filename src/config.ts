// Diisi dari file .env (EXPO_PUBLIC_API_URL). Contoh: https://domain-anda.com/api
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://domain-anda.com/api').replace(/\/+$/, '');

export const SESSION_STORAGE_KEY = 'eazyfit.trainer.session';

/** Pilihan pengulangan mingguan (jumlah total sesi, termasuk yang pertama). */
export const REPEAT_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'One-time' },
  { value: 2, label: '2 weeks' },
  { value: 3, label: '3 weeks' },
  { value: 4, label: '4 weeks' },
  { value: 8, label: '8 weeks' },
  { value: 12, label: '12 weeks' },
];
