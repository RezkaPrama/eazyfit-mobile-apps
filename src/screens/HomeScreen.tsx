import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import { loadDashboard } from '../store/dashboardSlice';
import { formatDateLong, formatIDR, monthKeyTitle, todayYMD } from '../utils/format';
import { Header, HeaderButton } from '../components/Header';
import { Card, ErrorState, Loading, SectionTitle } from '../components/ui';
import { SessionCard } from '../components/SessionCard';
import { useRefreshOnFocus } from '../components/useRefreshOnFocus';
import EarningsSheet from './EarningsSheet';

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const trainer = useAppSelector((s) => s.auth.trainer);
  const { data, loading, error } = useAppSelector((s) => s.dashboard);
  const [earningsOpen, setEarningsOpen] = useState(false);

  const load = () => dispatch(loadDashboard(todayYMD()));
  useRefreshOnFocus(load);

  const today = todayYMD();
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Good morning' : hour < 15 ? 'Good afternoon' : hour < 19 ? 'Good evening' : 'Good night';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={`${greet}, ${trainer?.name?.split(' ')[0] ?? 'Coach'}`}
        subtitle={formatDateLong(today)}
        right={<HeaderButton icon="add" filled onPress={() => nav.navigate('NewSession', { date: today })} />}
      />
      {!data && loading ? (
        <Loading />
      ) : !data && error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.link} />}
        >
          <SectionTitle>Today's Sessions</SectionTitle>
          {data.today_sessions.length === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: 28, marginBottom: 20 }}>
              <Ionicons name="calendar-outline" size={32} color={colors.faint} />
              <Text style={{ color: colors.muted, marginTop: 8 }}>No sessions scheduled for today.</Text>
            </Card>
          ) : (
            <View style={{ marginBottom: 10 }}>
              {data.today_sessions.map((s) => (
                <SessionCard key={s.id} session={s} onPress={() => nav.navigate('SessionDetail', { id: s.id })} />
              ))}
            </View>
          )}

          {data.packages_running_out.length > 0 ? (
            <>
              <SectionTitle>Packages Running Out</SectionTitle>
              <Card style={{ marginBottom: 20, paddingVertical: 6 }}>
                {data.packages_running_out.map((r, i) => (
                  <View
                    key={r.customer_id}
                    style={{
                      flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                      borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.text, flex: 1, fontWeight: '600' }} onPress={() => nav.navigate('StudentDetail', { customerId: r.customer_id })}>
                      {r.name}
                    </Text>
                    <Text style={{ color: colors.dangerText, fontWeight: '700' }}>
                      {r.remaining_sessions} left
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Card style={{ flex: 1, marginRight: 6 }}>
              <Ionicons name="people" size={20} color={colors.link} />
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 8 }}>{data.students_count}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Students</Text>
            </Card>
            <Card style={{ flex: 1, marginLeft: 6 }}>
              <Ionicons name="time" size={20} color={colors.link} />
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 8 }}>{data.scheduled_today}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Scheduled Today</Text>
            </Card>
          </View>

          <Card onPress={() => setEarningsOpen(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>This Month</Text>
              <Text style={{ color: colors.link, fontWeight: '600' }}>{monthKeyTitle(data.month.key)} ›</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Collected</Text>
                <Text style={{ color: colors.success, fontWeight: '800', marginTop: 2 }}>{formatIDR(data.month.collected)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Pending</Text>
                <Text style={{ color: colors.dangerText, fontWeight: '800', marginTop: 2 }}>{formatIDR(data.month.pending)}</Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      ) : null}

      <EarningsSheet visible={earningsOpen} onClose={() => setEarningsOpen(false)} currentMonth={data?.month.key ?? todayYMD().slice(0, 7)} />
    </View>
  );
}
