import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { colors } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { resetDashboard } from '../store/dashboardSlice';
import { resetStudents } from '../store/studentsSlice';
import { Header } from '../components/Header';
import { Avatar, Button, Card } from '../components/ui';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { user, trainer } = useAppSelector((s) => s.auth);

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          dispatch(resetDashboard());
          dispatch(resetStudents());
        },
      },
    ]);

  const Row = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <View style={{ paddingVertical: 10 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: 15, marginTop: 2 }}>{value}</Text>
      </View>
    ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ alignItems: 'center', marginBottom: 16 }}>
          <Avatar name={trainer?.name ?? user?.name ?? '?'} size={72} />
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 12 }}>{trainer?.name ?? user?.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>{user?.email}</Text>
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <Row label="Phone" value={trainer?.phone ?? user?.phone} />
          <Row label="Specialization" value={trainer?.specialization} />
          <Row label="App version" value={Constants.expoConfig?.version ?? '1.0.0'} />
        </Card>
        <Button title="Log out" variant="danger" icon="log-out-outline" onPress={confirmLogout} />
      </ScrollView>
    </View>
  );
}
