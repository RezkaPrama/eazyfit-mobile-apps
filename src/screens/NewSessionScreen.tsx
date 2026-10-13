import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { REPEAT_OPTIONS } from '../config';
import type { RootStackParamList } from '../navigation/types';
import type { SessionConflict } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorData, getErrorMessage, getErrorStatus } from '../utils/errors';
import { formatDateShort, formatTime12, todayYMD } from '../utils/format';
import { useAppDispatch, useAppSelector } from '../store';
import { loadStudents } from '../store/studentsSlice';
import { Header } from '../components/Header';
import { Avatar, Button, Chip, Label, TextField } from '../components/ui';
import { DateField, TimeField } from '../components/DateTimeField';
import { StudentPicker } from '../components/StudentPicker';

const DURATIONS = [30, 45, 60, 90, 120];
type Picked = { customer_id: number; name: string };

export default function NewSessionScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, 'NewSession'>['route']>();
  const editing = params?.session;
  const dispatch = useAppDispatch();
  const { items: allStudents, loaded } = useAppSelector((s) => s.students);

  const [picked, setPicked] = useState<Picked[]>(editing ? editing.students.map((s) => ({ customer_id: s.customer_id, name: s.name })) : []);
  const [isGroup, setIsGroup] = useState(editing?.is_group ?? false);
  const [date, setDate] = useState(editing?.date ?? params?.date ?? todayYMD());
  const [time, setTime] = useState(editing?.start_time ?? '09:00');
  const [duration, setDuration] = useState(editing?.duration_minutes ?? 60);
  const [exercise, setExercise] = useState(editing?.exercise_type ?? '');
  const [repeat, setRepeat] = useState(1);
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // siswa yang dipilih lewat tombol "Schedule" di detail siswa
  useEffect(() => {
    if (!params?.studentId || editing) return;
    if (!loaded) { dispatch(loadStudents(undefined)); return; }
    const s = allStudents.find((x) => x.customer_id === params.studentId);
    if (s && picked.length === 0) setPicked([{ customer_id: s.customer_id, name: s.name }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, allStudents]);

  const submit = async (allowOverlap: boolean) => {
    if (picked.length === 0) return Alert.alert('Select a student', 'Please choose at least one student.');
    setSaving(true);
    try {
      const base = {
        student_ids: picked.map((p) => p.customer_id),
        date,
        time,
        duration_minutes: duration,
        exercise_type: exercise.trim() || null,
        notes: notes.trim() || null,
        allow_overlap: allowOverlap || undefined,
      };
      if (editing) {
        await trainerApi.updateSession(editing.id, base);
      } else {
        await trainerApi.createSession({ ...base, is_group: isGroup, repeat_weeks: repeat });
      }
      dispatch(loadStudents(undefined));
      nav.goBack();
    } catch (e) {
      if (getErrorStatus(e) === 409) {
        const conflicts = getErrorData<{ conflicts: SessionConflict[] }>(e)?.conflicts ?? [];
        const lines = conflicts.slice(0, 4).map((c) => `• ${formatDateShort(c.date)} ${formatTime12(c.start_time)} – ${formatTime12(c.end_time)}`).join('\n');
        Alert.alert('Time conflict', `You already have a session at the same time:\n${lines}`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add anyway', onPress: () => submit(true) },
        ]);
      } else {
        Alert.alert('Error', getErrorMessage(e));
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (v: boolean) => {
    setIsGroup(v);
    if (!v) setPicked((p) => p.slice(0, 1));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={editing ? 'Edit Session' : 'New Session'} back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {!editing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Group session</Text>
              <Switch value={isGroup} onValueChange={toggleGroup} trackColor={{ true: colors.primary, false: colors.borderStrong }} thumbColor="#fff" />
            </View>
          ) : null}

          <Label>{isGroup || picked.length > 1 ? 'Students' : 'Student'}</Label>
          {picked.map((p) => (
            <View key={p.customer_id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: colors.card, padding: 10, borderRadius: 12 }}>
              <Avatar name={p.name} size={34} />
              <Text style={{ color: colors.text, fontWeight: '600', flex: 1, marginLeft: 10 }}>{p.name}</Text>
              <Pressable hitSlop={8} onPress={() => setPicked((c) => c.filter((x) => x.customer_id !== p.customer_id))}>
                <Text style={{ color: colors.dangerText, fontWeight: '700' }}>Remove</Text>
              </Pressable>
            </View>
          ))}
          <Button
            title={picked.length === 0 ? 'Select student' : isGroup ? 'Add / change students' : 'Change student'}
            variant="outline" icon="person-add-outline" style={{ marginBottom: 18 }}
            onPress={() => setPickerOpen(true)}
          />

          <DateField label="Date" value={date} onChange={setDate} />
          <TimeField label="Start time" value={time} onChange={setTime} />

          <Label>Duration</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {DURATIONS.map((d) => <Chip key={d} label={`${d} min`} selected={duration === d} onPress={() => setDuration(d)} />)}
          </ScrollView>

          <TextField label="Exercise type (optional)" value={exercise} onChangeText={setExercise} placeholder="e.g. Upper body, Cardio" />

          {!editing ? (
            <>
              <Label>Repeat weekly</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {REPEAT_OPTIONS.map((o) => <Chip key={o.value} label={o.label} selected={repeat === o.value} onPress={() => setRepeat(o.value)} />)}
              </ScrollView>
            </>
          ) : null}

          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
          <Button title={editing ? 'Save changes' : 'Schedule session'} onPress={() => submit(false)} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>

      <StudentPicker
        visible={pickerOpen}
        multiple={isGroup}
        selected={picked.map((p) => p.customer_id)}
        onClose={() => setPickerOpen(false)}
        onDone={(list) => { setPicked(list.map((s) => ({ customer_id: s.customer_id, name: s.name }))); setPickerOpen(false); }}
      />
    </View>
  );
}
