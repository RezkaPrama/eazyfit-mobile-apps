import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Measurement } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import { formatDateShort, todayYMD } from '../utils/format';
import { Header, HeaderButton } from '../components/Header';
import { Button, Card, EmptyState, ErrorState, Loading, TextField } from '../components/ui';
import { DateField } from '../components/DateTimeField';
import { useRefreshOnFocus } from '../components/useRefreshOnFocus';

const FIELDS: { key: keyof Measurement; label: string; unit: string }[] = [
  { key: 'weight', label: 'Weight', unit: 'kg' },
  { key: 'height', label: 'Height', unit: 'cm' },
  { key: 'body_fat', label: 'Body fat', unit: '%' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hip', label: 'Hip', unit: 'cm' },
  { key: 'arm', label: 'Arm', unit: 'cm' },
  { key: 'thigh', label: 'Thigh', unit: 'cm' },
];

const num = (s: string) => {
  const v = parseFloat(s.replace(',', '.'));
  return Number.isFinite(v) ? v : null;
};

export default function MeasurementsScreen() {
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, 'Measurements'>['route']>();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Measurement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayYMD());
  const [vals, setVals] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setItems(await trainerApi.fetchMeasurements(params.customerId));
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }, [params.customerId]);
  useRefreshOnFocus(() => { load(); });

  const openForm = () => { setDate(todayYMD()); setVals({}); setNotes(''); setOpen(true); };

  const save = async () => {
    const body: Record<string, unknown> = { measurement_date: date, notes: notes.trim() || undefined };
    let any = false;
    FIELDS.forEach((f) => {
      const v = num(vals[f.key] ?? '');
      if (v !== null) { body[f.key] = v; any = true; }
    });
    if (!any) return Alert.alert('Nothing to save', 'Enter at least one measurement.');
    setSaving(true);
    try {
      await trainerApi.createMeasurement(params.customerId, body);
      setOpen(false);
      await load();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = (m: Measurement) =>
    Alert.alert('Delete measurement', 'Delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await trainerApi.deleteMeasurement(params.customerId, m.id); await load(); }
          catch (e) { Alert.alert('Error', getErrorMessage(e)); }
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Measurements" subtitle={params.studentName} back right={<HeaderButton icon="add" filled onPress={openForm} />} />
      {!items && !error ? (
        <Loading />
      ) : error && !items ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.link} />}
        >
          {items && items.length === 0 ? (
            <EmptyState icon="body-outline" title="No measurements yet" subtitle="Tap + to record the first one." />
          ) : (
            items?.map((m) => (
              <Card key={m.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{m.measurement_date ? formatDateShort(m.measurement_date) : '—'}</Text>
                  <Text style={{ color: colors.dangerText, fontWeight: '600' }} onPress={() => remove(m)}>Delete</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {FIELDS.filter((f) => m[f.key] != null).map((f) => (
                    <View key={f.key} style={{ width: '33.33%', marginBottom: 8 }}>
                      <Text style={{ color: colors.muted, fontSize: 11 }}>{f.label}</Text>
                      <Text style={{ color: colors.text, fontWeight: '700' }}>{String(m[f.key])} {f.unit}</Text>
                    </View>
                  ))}
                  {m.bmi != null ? (
                    <View style={{ width: '33.33%', marginBottom: 8 }}>
                      <Text style={{ color: colors.muted, fontSize: 11 }}>BMI</Text>
                      <Text style={{ color: colors.link, fontWeight: '700' }}>{m.bmi}{m.bmi_category ? ` · ${m.bmi_category}` : ''}</Text>
                    </View>
                  ) : null}
                </View>
                {m.notes ? <Text style={{ color: colors.muted, fontSize: 12 }}>{m.notes}</Text> : null}
              </Card>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', flex: 1 }}>New measurement</Text>
            <Text style={{ color: colors.link, fontWeight: '700' }} onPress={() => setOpen(false)}>Cancel</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
            <DateField label="Date" value={date} onChange={setDate} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {FIELDS.map((f) => (
                <View key={f.key} style={{ width: '48%' }}>
                  <TextField
                    label={`${f.label} (${f.unit})`}
                    value={vals[f.key] ?? ''}
                    onChangeText={(t) => setVals((v) => ({ ...v, [f.key]: t.replace(/[^0-9.,]/g, '') }))}
                    keyboardType="decimal-pad"
                  />
                </View>
              ))}
            </View>
            <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
            <Button title="Save" onPress={save} loading={saving} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
