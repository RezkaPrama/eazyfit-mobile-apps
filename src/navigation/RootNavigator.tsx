import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useAppSelector } from '../store';
import { Loading } from '../components/ui';
import type { RootStackParamList, TabParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import StudentsScreen from '../screens/StudentsScreen';
import SessionsScreen from '../screens/SessionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import StudentFormScreen from '../screens/StudentFormScreen';
import PackageFormScreen from '../screens/PackageFormScreen';
import MeasurementsScreen from '../screens/MeasurementsScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import NewSessionScreen from '../screens/NewSessionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Warna menu aktif (tosca sesuai logo). Ganti sesuai selera, atau pakai warna dari theme.
const ACTIVE_COLOR = '#3EDFCF';

const ICONS: Record<keyof TabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ['home', 'home-outline'],
  Calendar: ['calendar', 'calendar-outline'],
  Students: ['people', 'people-outline'],
  Sessions: ['list', 'list-outline'],
  Settings: ['settings', 'settings-outline'],
};

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: { backgroundColor: colors.header, borderTopColor: colors.border, height: 58 + insets.bottom, paddingBottom: insets.bottom + 4, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const status = useAppSelector((s) => s.auth.status);
  if (status === 'booting') return <Loading />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      {status === 'signedIn' ? (
        <>
          <Stack.Screen name="Main" component={Tabs} />
          <Stack.Screen name="NewSession" component={NewSessionScreen} />
          <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
          <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
          <Stack.Screen name="StudentForm" component={StudentFormScreen} />
          <Stack.Screen name="PackageForm" component={PackageFormScreen} />
          <Stack.Screen name="Measurements" component={MeasurementsScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}