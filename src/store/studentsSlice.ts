import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import type { Student } from '../types';

interface State {
  items: Student[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
}

const initialState: State = { items: [], loading: false, error: null, loaded: false };

export const loadStudents = createAsyncThunk<Student[], string | undefined, { rejectValue: string }>(
  'students/load',
  async (search, { rejectWithValue }) => {
    try {
      return await trainerApi.fetchStudents(search);
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

const slice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    resetStudents: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(loadStudents.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(loadStudents.fulfilled, (s, a) => {
      s.loading = false;
      s.loaded = true;
      s.items = a.payload;
    });
    b.addCase(loadStudents.rejected, (s, a) => {
      s.loading = false;
      s.error = a.payload ?? 'Failed to load.';
    });
  },
});

export const { resetStudents } = slice.actions;
export default slice.reducer;
