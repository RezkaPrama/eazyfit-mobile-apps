import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Session, SessionStatus, Student } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import { formatDateShort, todayYMD } from '../utils/format';
import { Header, HeaderButton } from '../components/Header';
import { Chip, EmptyState, ErrorState, Loading, statusLabel } from '../components/ui';
import { SessionCard } from '../components/SessionCard';
import { StudentPicker } from '../components/StudentPicker';
import { DateField } from '../components/DateTimeField';
import { useRefreshOnFocus } from '../components/useRefreshOnFocus';

type StatusFilter = SessionStatus | 'all';
const STATUSES: StatusFilter[] = ['all', 'scheduled', 'completed', 'cancelled', 'no_show'];

export default function SessionsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [student, setStudent] = useState<Student | null>(null);
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [items, setItems] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  const fetchPage = useCallback(
    async (p: number) => {
      const id = ++reqId.current;
      p === 1 ? setLoading(true) : setMore(true);
      try {
        const res = await trainerApi.fetchSessions({
          status, student_id: student?.customer_id, from: from ?? undefined, to: to ?? undefined, sort: 'desc', page: p, per_page: 20,
        });
        if (id !== reqId.current) return;
        setItems((cur) => (p === 1 ? res.items : [...cur, ...res.items.filter((n) => !cur.some((c) => c.id === n.id))]));
        setPage(res.meta?.current_page ?? p);
        setLastPage(res.meta?.last_page ?? p);
        setError(null);
      } catch (e) {
        if (id === reqId.current) setError(getErrorMessage(e));
      } finally {
        if (id === reqId.current) { setLoading(false); setMore(false); }
      }
    },
    [status, student, from, to]
  );

  React.useEffect(() => { fetchPage(1); }, [fetchPage]);
  useRefreshOnFocus(() => { fetchPage(1); });

  const hasFilter = status !== 'all' || !!student || !!from || !!to;
  const reset = () => { setStatus('all'); setStudent(null); setFrom(null); setTo(null); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Sessions" right={<HeaderButton icon="add" filled onPress={() => nav.navigate('NewSession')} />} />
      <View style={{ paddingTop: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {STATUSES.map((s) => (
            <Chip key={s} label={s === 'all' ? 'All' : statusLabel(s)} selected={status === s} onPress={() => setStatus(s)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
          <Chip label={student ? `Student: ${student.name}` : 'Student'} selected={!!student} onPress={() => setPickerOpen(true)} />
          <Chip label={from ? `From ${formatDateShort(from)}` : 'From'} selected={!!from} onPress={() => setFrom(from ? null : todayYMD())} />
          <Chip label={to ? `To ${formatDateShort(to)}` : 'To'} selected={!!to} onPress={() => setTo(to ? null : todayYMD())} />
          {hasFilter ? <Chip label="Reset" onPress={reset} /> : null}
        </ScrollView>
        {from || to ? (
          <View style={{ paddingHorizontal: 16 }}>
            {from ? <DateField label="From" value={from} onChange={setFrom} /> : null}
            {to ? <DateField label="To" value={to} onChange={setTo} /> : null}
          </View>
        ) : null}
      </View>

      {loading && items.length === 0 ? (
        <Loading />
      ) : error && items.length === 0 ? (
        <ErrorState message={error} onRetry={() => fetchPage(1)} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={loading && items.length > 0} onRefresh={() => fetchPage(1)} tintColor={colors.link} />}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="No sessions found" />}
          renderItem={({ item }) => <SessionCard session={item} showDate onPress={() => nav.navigate('SessionDetail', { id: item.id })} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => { if (!more && !loading && page < lastPage) fetchPage(page + 1); }}
          ListFooterComponent={more ? <ActivityIndicator color={colors.link} style={{ marginVertical: 16 }} /> : null}
        />
      )}

      <StudentPicker
        visible={pickerOpen}
        selected={student ? [student.customer_id] : []}
        onClose={() => setPickerOpen(false)}
        onDone={(list) => { setStudent(list[0] ?? null); setPickerOpen(false); }}
      />
    </View>
  );
}
