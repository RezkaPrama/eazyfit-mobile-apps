// Semua tanggal/jam diperlakukan sebagai teks lokal ("YYYY-MM-DD", "HH:mm") agar tidak
// terkena pergeseran zona waktu.

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const pad = (n: number) => String(n).padStart(2, '0');

export function toYMD(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayYMD(): string {
  return toYMD(new Date());
}

export function addDays(ymd: string, n: number): string {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + n);
  return toYMD(d);
}

export function addMonths(ymd: string, n: number): string {
  const d = parseYMD(ymd);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return toYMD(d);
}

/** Senin dari minggu yang memuat tanggal ini. */
export function startOfWeek(ymd: string): string {
  const d = parseYMD(ymd);
  const diff = (d.getDay() + 6) % 7; // Senin = 0
  d.setDate(d.getDate() - diff);
  return toYMD(d);
}

/** 42 sel (6 minggu) untuk kalender bulanan, mulai Senin. */
export function monthGrid(ymd: string): string[] {
  const first = parseYMD(ymd);
  first.setDate(1);
  const start = startOfWeek(toYMD(first));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** "Wed, Oct 07, 2026" */
export function formatDateShort(ymd: string): string {
  const d = parseYMD(ymd);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${pad(d.getDate())}, ${d.getFullYear()}`;
}

/** "Thursday, October 8" */
export function formatDateLong(ymd: string): string {
  const d = parseYMD(ymd);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}`;
}

/** "Oct 7" */
export function formatDayMonth(ymd: string): string {
  const d = parseYMD(ymd);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function weekdayShort(ymd: string): string {
  return WEEKDAYS_SHORT[parseYMD(ymd).getDay()];
}

export function dayOfMonth(ymd: string): number {
  return parseYMD(ymd).getDate();
}

/** "2026-10" -> "Oct" */
export function monthShort(ym: string): string {
  return MONTHS_SHORT[Number(ym.slice(5, 7)) - 1];
}

/** "2026-10-12" -> "October 2026" */
export function monthTitle(ymd: string): string {
  const d = parseYMD(ymd);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** "2026-10" -> "October 2026" */
export function monthKeyTitle(ym: string): string {
  return `${MONTHS_LONG[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
}

/** "09:00" -> "9:00 AM" */
export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${suffix}`;
}

export function toHHMM(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function hhmmToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/** 1000000 -> "IDR 1,000,000.00" */
export function formatIDR(n: number): string {
  const [int, frac] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '-' : ''}IDR ${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${frac}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?';
}
