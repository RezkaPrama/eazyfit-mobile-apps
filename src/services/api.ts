import axios from 'axios';
import { API_URL } from '../config';

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(t: string | null) {
  token = t;
}
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && token) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;
