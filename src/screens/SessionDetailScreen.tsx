import React, { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Session, SessionStatus } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import { formatDateLong, formatTime12 } from '../utils/format';
import { useAppDispatch } from '../store';
import { loadStudents } from '../store/studentsSlice';
import { Header, HeaderButton } from '../components/Header';
import { Avatar, Button, Card, ErrorState, Loading, StatusBadge, TextField } from '../components/ui';
import { useRefreshOnFocus } from '../components/useRefreshOnFocus';

export default function SessionDetailScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, 'SessionDetail'>['route']>();
  const dispatch = useAppDispatch();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [exercise, setExercise] = useState('');

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setSession(await trainerApi.fetchSession(params.id));
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }, [params.id]);
  useRefreshOnFocus(() => { load(); });

  const setStatus = async (status: SessionStatus, ex?: string) => {
    setBusy(true);
    try {
      setSession(await trainerApi.changeSessionStatus(params.id, status, ex));
      dispatch(loadStudents(undefined)); // sisa sesi berubah
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const confirmStatus = (status: SessionStatus, title: string, msg: string) =>
    Alert.alert(title, msg, [{ text: 'No', style: 'cancel' }, { text: 'Yes', onPress: () => setStatus(status) }]);

  const doDelete = async (scope?: 'series') => {
    try {
      await trainerApi.deleteSession(params.id, scope);
      dispatch(loadStudents(undefined));
      nav.goBack();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  };

  const remove = () => {
    if (!session) return;
    const buttons = [{ text: 'Cancel', style: 'cancel' as const }, { text: 'Delete this session', style: 'destructive' as const, onPress: () => doDelete() }];
    if (session.series_id) buttons.push({ text: 'Delete whole series', style: 'destructive', onPress: () => doDelete('series') });
    Alert.alert('Delete session', session.series_id ? 'This session is part of a repeating series.' : 'Delete this session?', buttons);
  };

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Header title="Session" back />
        {error ? <ErrorState message={error} onRetry={load} /> : <Loading />}
      </View>
    );
  }

  const s = session;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title="Session"
        back
        right={s.status === 'scheduled' ? <HeaderButton icon="create-outline" onPress={() => nav.navigate('NewSession', { session: s })} /> : undefined}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.link} />}
      >
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', flex: 1 }}>{formatDateLong(s.date)}</Text>
            <StatusBadge status={s.status} />
          </View>
          <Text style={{ color: colors.link, fontWeight: '700', marginTop: 6 }}>
            {formatTime12(s.start_time)} – {formatTime12(s.end_time)} · {s.duration_minutes} min
          </Text>
          {s.exercise_type ? <Text style={{ color: colors.muted, marginTop: 8 }}>Exercise: {s.exercise_type}</Text> : null}
          {s.notes ? <Text style={{ color: colors.muted, marginTop: 6 }}>{s.notes}</Text> : null}
          {s.series_id ? <Text style={{ color: colors.faint, fontSize: 12, marginTop: 8 }}>Part of a weekly series</Text> : null}
        </Card>

        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>
          {s.is_group ? 'Students' : 'Student'}
        </Text>
        {s.students.map((st) => (
          <Pressable
            key={st.customer_id}
            onPress={() => nav.navigate('StudentDetail', { customerId: st.customer_id })}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}
          >
            <Avatar name={st.name} size={38} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{st.name}</Text>
              <Text style={{ color: st.remaining_sessions <= 2 ? colors.dangerText : colors.muted, fontSize: 12 }}>
                {st.remaining_sessions} sessions left
              </Text>
            </View>
          </Pressable>
        ))}

        <View style={{ marginTop: 16 }}>
          {s.status === 'scheduled' ? (
            <>
              <Button title="Complete session" icon="checkmark-circle" loading={busy} onPress={() => { setExercise(s.exercise_type ?? ''); setCompleteOpen(true); }} style={{ marginBottom: 10 }} />
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Button title="No show" variant="outline" disabled={busy} style={{ flex: 1, marginRight: 8 }}
                  onPress={() => confirmStatus('no_show', 'Mark as no show', 'The student did not attend this session?')} />
                <Button title="Cancel" variant="outline" disabled={busy} style={{ flex: 1 }}
                  onPress={() => confirmStatus('cancelled', 'Cancel session', 'Cancel this session?')} />
              </View>
            </>
          ) : (
            <Button
              title="Set back to scheduled" variant="outline" loading={busy} style={{ marginBottom: 10 }}
              onPress={() => confirmStatus('scheduled', 'Revert status', s.status === 'completed' ? 'This will give the session back to the student\'s package.' : 'Set this session back to scheduled?')}
            />
          )}
          <Button title="Delete session" variant="danger" onPress={remove} />
        </View>
      </ScrollView>

      <Modal visible={completeOpen} transparent animationType="fade" onRequestClose={() => setCompleteOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.header, borderRadius: 18, padding: 20 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>Complete session</Text>
            <Text style={{ color: colors.muted, marginBottom: 16 }}>What did you train? (optional)</Text>
            <TextField value={exercise} onChangeText={setExercise} placeholder="e.g. Upper body" autoFocus />
            <View style={{ flexDirection: 'row' }}>
              <Button title="Back" variant="outline" style={{ flex: 1, marginRight: 8 }} onPress={() => setCompleteOpen(false)} />
              <Button title="Complete" style={{ flex: 1 }} onPress={() => { setCompleteOpen(false); setStatus('completed', exercise.trim()); }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
