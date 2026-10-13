import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Package, Session, Student } from '../types';

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Students: undefined;
  Sessions: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  NewSession: { date?: string; studentId?: number; session?: Session } | undefined;
  SessionDetail: { id: number };
  StudentDetail: { customerId: number };
  StudentForm: { student?: Student } | undefined;
  PackageForm: { customerId: number; studentName: string; pkg?: Package };
  Measurements: { customerId: number; studentName: string };
};
