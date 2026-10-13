import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { setUnauthorizedHandler } from '../services/api';
import auth, { logoutLocal } from './authSlice';
import dashboard from './dashboardSlice';
import students from './studentsSlice';

export const store = configureStore({ reducer: { auth, dashboard, students } });

setUnauthorizedHandler(() => store.dispatch(logoutLocal()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
