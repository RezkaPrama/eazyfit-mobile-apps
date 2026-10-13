import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import type { Dashboard, Earnings } from '../types';

interface State {
  data: Dashboard | null;
  loading: boolean;
  error: string | null;
  earnings: Earnings | null;
  earningsLoading: boolean;
  earningsError: string | null;
}

const initialState: State = {
  data: null, loading: false, error: null, earnings: null, earningsLoading: false, earningsError: null,
};

export const loadDashboard = createAsyncThunk<Dashboard, string, { rejectValue: string }>(
  'dashboard/load',
  async (date, { rejectWithValue }) => {
    try {
      return await trainerApi.fetchDashboard(date);
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const loadEarnings = createAsyncThunk<Earnings, void, { rejectValue: string }>(
  'dashboard/earnings',
  async (_, { rejectWithValue }) => {
    try {
      return await trainerApi.fetchEarnings();
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(loadDashboard.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(loadDashboard.fulfilled, (s, a) => {
      s.loading = false;
      s.data = a.payload;
    });
    b.addCase(loadDashboard.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? 'Failed to load.';
    });
    b.addCase(loadEarnings.pending, (s) => {
      s.earningsLoading = true;
      s.earningsError = null;
    });
    b.addCase(loadEarnings.fulfilled, (s, a) => {
      s.earningsLoading = false;
      s.earnings = a.payload;
    });
    b.addCase(loadEarnings.rejected, (s, a) => {
      s.earningsLoading = false;
      s.earningsError = a.payload ?? 'Failed to load.';
    });
  },
});

export const { resetDashboard } = slice.actions;
export default slice.reducer;
