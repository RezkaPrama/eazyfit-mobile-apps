import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Session } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import {
  addDays, addMonths, dayOfMonth, formatDateLong, monthGrid, monthTitle, startOfWeek, todayYMD, WEEKDAY_HEADERS,
} from '../utils/format';
import { Header, HeaderButton } from '../components/Header';
import { Chip, EmptyState, ErrorState } from '../components/ui';
import { SessionCard } from '../components/SessionCard';
import { useRefreshOnFocus } from '../components/useRefreshOnFocus';

export default function CalendarScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const today = todayYMD();
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [selected, setSelected] = useState(today);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  const cells = useMemo(
    () => (mode === 'month' ? monthGrid(selected) : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selected), i))),
    [mode, selected]
  );
  const from = cells[0];
  const to = cells[cells.length - 1];

  const load = useCallback(async () => {
    const id = ++reqId.current;
    try {
      const res = await trainerApi.fetchSessions({ from, to, sort: 'asc', per_page: 500 });
      if (id !== reqId.current) return; // abaikan respons usang
      setSessions(res.items);
      setError(null);
    } catch (e) {
      if (id === reqId.current) setError(getErrorMessage(e));
    }
  }, [from, to]);

  useRefreshOnFocus(() => { load(); });
  React.useEffect(() => { load(); }, [load]);

  const byDay = useMemo(() => {
    const m: Record<string, Session[]> = {};
    sessions.forEach((s) => { (m[s.date] ||= []).push(s); });
    return m;
  }, [sessions]);

  const step = (dir: 1 | -1) => setSelected((d) => (mode === 'month' ? addMonths(d, dir) : addDays(d, 7 * dir)));
  const title = mode === 'month' ? monthTitle(selected) : `${monthTitle(cells[0])}`;
  const daySessions = byDay[selected] ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Calendar" right={<HeaderButton icon="add" filled onPress={() => nav.navigate('NewSession', { date: selected })} />} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          <Chip label="Week" selected={mode === 'week'} onPress={() => setMode('week')} />
          <Chip label="Month" selected={mode === 'month'} onPress={() => setMode('month')} />
          <View style={{ flex: 1 }} />
          <Chip label="Today" onPress={() => setSelected(today)} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Pressable onPress={() => step(-1)} hitSlop={10}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>
          <Pressable onPress={() => step(1)} hitSlop={10}><Ionicons name="chevron-forward" size={24} color={colors.text} /></Pressable>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {WEEKDAY_HEADERS.map((w) => (
            <Text key={w} style={{ flex: 1, textAlign: 'center', color: colors.muted, fontSize: 12, fontWeight: '600' }}>{w}</Text>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 }}>
          {cells.map((d) => {
            const isSel = d === selected;
            const inMonth = mode === 'week' || d.slice(0, 7) === selected.slice(0, 7);
            const n = byDay[d]?.length ?? 0;
            return (
              <Pressable key={d} onPress={() => setSelected(d)} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 5 }}>
                <View
                  style={{
                    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSel ? colors.selected : 'transparent',
                    borderWidth: d === today && !isSel ? 1 : 0, borderColor: colors.link,
                  }}
                >
                  <Text style={{ color: isSel ? '#fff' : inMonth ? colors.text : colors.faint, fontWeight: isSel ? '800' : '500' }}>
                    {dayOfMonth(d)}
                  </Text>
                </View>
                <View style={{ height: 6, marginTop: 3, flexDirection: 'row' }}>
                  {Array.from({ length: Math.min(n, 3) }).map((_, i) => (
                    <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.link, marginHorizontal: 1 }} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>{formatDateLong(selected)}</Text>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : daySessions.length === 0 ? (
          <View style={{ height: 160 }}>
            <EmptyState icon="calendar-outline" title="No sessions" subtitle="Tap + to schedule one." />
          </View>
        ) : (
          daySessions.map((s) => <SessionCard key={s.id} session={s} onPress={() => nav.navigate('SessionDetail', { id: s.id })} />)
        )}
      </ScrollView>
    </View>
  );
}
