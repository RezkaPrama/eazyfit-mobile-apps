import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SESSION_STORAGE_KEY } from '../config';
import { setAuthToken } from '../services/api';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage, getErrorStatus } from '../utils/errors';
import type { TrainerProfile, User } from '../types';

interface AuthState {
  status: 'booting' | 'signedOut' | 'signedIn';
  token: string | null;
  user: User | null;
  trainer: TrainerProfile | null;
  loggingIn: boolean;
  error: string | null;
}

const initialState: AuthState = {
  status: 'booting', token: null, user: null, trainer: null, loggingIn: false, error: null,
};

export const restoreSession = createAsyncThunk('auth/restore', async () => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { token: string; user: User; trainer: TrainerProfile };
    if (!saved?.token) return null;
    setAuthToken(saved.token);
    try {
      const me = await trainerApi.fetchMe();
      const session = { token: saved.token, ...me };
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (e) {
      const code = getErrorStatus(e);
      if (code === 401 || code === 403) {
        setAuthToken(null);
        await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      return saved; // offline: tetap masuk dengan sesi tersimpan
    }
  } catch {
    return null;
  }
});

export const login = createAsyncThunk<
  { token: string; user: User; trainer: TrainerProfile },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await trainerApi.login(email.trim(), password);
    setAuthToken(res.token);
    try {
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(res));
    } catch {}
    return res;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await trainerApi.logout();
  } catch {}
  setAuthToken(null);
  try {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Dipanggil saat server menjawab 401. */
    logoutLocal(state) {
      setAuthToken(null);
      AsyncStorage.removeItem(SESSION_STORAGE_KEY).catch(() => {});
      Object.assign(state, { status: 'signedOut', token: null, user: null, trainer: null });
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(restoreSession.fulfilled, (s, a) => {
      if (a.payload) Object.assign(s, { status: 'signedIn', ...a.payload });
      else s.status = 'signedOut';
    });
    b.addCase(restoreSession.rejected, (s) => {
      s.status = 'signedOut';
    });
    b.addCase(login.pending, (s) => {
      s.loggingIn = true;
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => {
      s.loggingIn = false;
      Object.assign(s, { status: 'signedIn', ...a.payload });
    });
    b.addCase(login.rejected, (s, a) => {
      s.loggingIn = false;
      s.error = a.payload ?? 'Login failed.';
    });
    b.addCase(logout.fulfilled, (s) => {
      Object.assign(s, { status: 'signedOut', token: null, user: null, trainer: null });
    });
  },
});

export const { logoutLocal, clearAuthError } = slice.actions;
export default slice.reducer;
