export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'paid' | 'unpaid';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: PageMeta;
}

export interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface TrainerProfile {
  id: number;
  name: string;
  phone: string | null;
  specialization: string | null;
}

export interface Package {
  id: number; // pt_members.id
  customer_id: number;
  pt_package_id: number;
  name: string;
  type: string;
  is_custom: boolean;
  price: number;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  payment_status: PaymentStatus;
  paid_at: string | null;
  registration_date: string | null;
  notes: string | null;
}

export interface Student {
  customer_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  membership_code: string | null;
  current_package: Package | null;
  remaining_sessions_total: number;
  unpaid_total: number;
  packages_count: number;
  packages?: Package[];
}

export interface SessionStudent {
  customer_id: number;
  name: string;
  phone: string | null;
  pt_member_id: number | null;
  remaining_sessions: number;
}

export interface Session {
  id: number;
  series_id: string | null;
  status: SessionStatus;
  is_group: boolean;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  duration_minutes: number;
  exercise_type: string | null;
  notes: string | null;
  completed_at: string | null;
  students: SessionStudent[];
}

export interface RunningOutItem {
  customer_id: number;
  name: string;
  remaining_sessions: number;
}

export interface Dashboard {
  date: string;
  today_sessions: Session[];
  scheduled_today: number;
  students_count: number;
  packages_running_out: RunningOutItem[];
  month: { key: string; collected: number; pending: number };
}

export interface EarningsItem {
  pt_member_id: number;
  customer_id: number;
  student_name: string;
  package_name: string;
  price: number;
  payment_status: PaymentStatus;
}

export interface EarningsMonth {
  month: string; // YYYY-MM
  collected: number;
  pending: number;
  count: number;
  items: EarningsItem[];
}

export interface Earnings {
  months: EarningsMonth[];
  total_outstanding: number;
  all_time_collected: number;
}

export interface CatalogPackage {
  id: number;
  name: string;
  type: string;
  total_sessions: number;
  price: number;
  description: string | null;
}

export interface Measurement {
  id: number;
  measurement_date: string | null;
  weight: number | null;
  height: number | null;
  chest: number | null;
  waist: number | null;
  hip: number | null;
  arm: number | null;
  thigh: number | null;
  body_fat: number | null;
  bmi: number | null;
  bmi_category: string | null;
  notes: string | null;
}

export interface MemberSearchResult {
  customer_id: number;
  name: string;
  phone: string | null;
  email: string | null;
  membership_code: string | null;
}

export interface SessionConflict {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  students: string[];
}
