import api from './api';
import type {
  ApiEnvelope, CatalogPackage, Dashboard, Earnings, Measurement, MemberSearchResult,
  Package, PageMeta, Session, SessionStatus, Student, TrainerProfile, User,
} from '../types';

const unwrap = async <T>(p: Promise<{ data: ApiEnvelope<T> }>): Promise<T> => (await p).data.data;

// ---- Auth
export const login = (email: string, password: string) =>
  unwrap<{ token: string; user: User; trainer: TrainerProfile }>(
    api.post('/trainer/login', { email, password, device_name: 'trainer-app' })
  );
export const fetchMe = () => unwrap<{ user: User; trainer: TrainerProfile }>(api.get('/trainer/me'));
export const logout = () => api.post('/trainer/logout');

// ---- Dashboard
export const fetchDashboard = (date: string) => unwrap<Dashboard>(api.get('/trainer/dashboard', { params: { date } }));
export const fetchEarnings = (month?: string) => unwrap<Earnings>(api.get('/trainer/earnings', { params: { month } }));

// ---- Students
export const fetchStudents = (search?: string) =>
  unwrap<Student[]>(api.get('/trainer/students', { params: { search: search || undefined } }));
export const fetchStudent = (id: number) => unwrap<Student>(api.get(`/trainer/students/${id}`));
export const createStudent = (body: { customer_id?: number; name?: string; email?: string; phone?: string }) =>
  unwrap<Student>(api.post('/trainer/students', body));
export const updateStudent = (id: number, body: { name: string; email?: string | null; phone?: string | null }) =>
  unwrap<Student>(api.put(`/trainer/students/${id}`, body));
export const deleteStudent = (id: number) => api.delete(`/trainer/students/${id}`);
export const searchMembers = (q: string) =>
  unwrap<MemberSearchResult[]>(api.get('/trainer/members/search', { params: { q } }));

// ---- Measurements
export const fetchMeasurements = (id: number) => unwrap<Measurement[]>(api.get(`/trainer/students/${id}/measurements`));
export const createMeasurement = (id: number, body: Record<string, unknown>) =>
  unwrap<Measurement>(api.post(`/trainer/students/${id}/measurements`, body));
export const deleteMeasurement = (id: number, mid: number) => api.delete(`/trainer/students/${id}/measurements/${mid}`);

// ---- Packages
export const fetchCatalog = () => unwrap<CatalogPackage[]>(api.get('/trainer/packages/catalog'));
export const createPackage = (studentId: number, body: Record<string, unknown>) =>
  unwrap<Package>(api.post(`/trainer/students/${studentId}/packages`, body));
export const updatePackage = (id: number, body: Record<string, unknown>) =>
  unwrap<Package>(api.put(`/trainer/packages/${id}`, body));
export const deletePackage = (id: number) => api.delete(`/trainer/packages/${id}`);
export const payPackage = (id: number) => unwrap<Package>(api.post(`/trainer/packages/${id}/pay`));
export const unpayPackage = (id: number) => unwrap<Package>(api.post(`/trainer/packages/${id}/unpay`));

// ---- Sessions
export interface SessionQuery {
  status?: SessionStatus | 'all';
  student_id?: number;
  from?: string;
  to?: string;
  sort?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
export async function fetchSessions(params: SessionQuery): Promise<{ items: Session[]; meta?: PageMeta }> {
  const res = await api.get<ApiEnvelope<Session[]>>('/trainer/sessions', { params });
  return { items: res.data.data, meta: res.data.meta };
}
export const fetchSession = (id: number) => unwrap<Session>(api.get(`/trainer/sessions/${id}`));
export interface SessionPayload {
  student_ids: number[];
  is_group?: boolean;
  date: string;
  time: string;
  duration_minutes?: number;
  repeat_weeks?: number;
  exercise_type?: string | null;
  notes?: string | null;
  allow_overlap?: boolean;
}
export const createSession = (body: SessionPayload) => unwrap<Session[]>(api.post('/trainer/sessions', body));
export const updateSession = (id: number, body: Partial<SessionPayload>) =>
  unwrap<Session>(api.put(`/trainer/sessions/${id}`, body));
export const changeSessionStatus = (id: number, status: SessionStatus, exercise_type?: string | null) =>
  unwrap<Session>(api.post(`/trainer/sessions/${id}/status`, { status, exercise_type: exercise_type || undefined }));
export const deleteSession = (id: number, scope?: 'series') =>
  api.delete(`/trainer/sessions/${id}`, { params: scope ? { scope } : undefined });
