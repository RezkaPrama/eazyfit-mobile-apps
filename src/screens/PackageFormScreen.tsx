import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { CatalogPackage } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import { todayYMD } from '../utils/format';
import { Header } from '../components/Header';
import { Button, Chip, Label, TextField } from '../components/ui';
import { DateField } from '../components/DateTimeField';

const digits = (s: string) => s.replace(/[^0-9]/g, '');

export default function PackageFormScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, 'PackageForm'>['route']>();
  const pkg = params.pkg;

  const [catalog, setCatalog] = useState<CatalogPackage[]>([]);
  const [catalogId, setCatalogId] = useState<number | 'custom'>('custom');
  const [name, setName] = useState(pkg?.name ?? '');
  const [price, setPrice] = useState(pkg ? String(Math.round(pkg.price)) : '');
  const [sessions, setSessions] = useState(pkg ? String(pkg.total_sessions) : '');
  const [notes, setNotes] = useState(pkg?.notes ?? '');
  const [paid, setPaid] = useState(true);
  const [date, setDate] = useState(pkg?.registration_date ?? todayYMD());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pkg) return;
    trainerApi.fetchCatalog().then(setCatalog).catch(() => {});
  }, [pkg]);

  const choose = (c: CatalogPackage | 'custom') => {
    if (c === 'custom') {
      setCatalogId('custom');
      setName(''); setPrice(''); setSessions('');
    } else {
      setCatalogId(c.id);
      setName(c.name);
      setPrice(String(Math.round(c.price)));
      setSessions(String(c.total_sessions));
    }
  };

  const save = async () => {
    const total = parseInt(sessions || '0', 10);
    const amount = parseInt(price || '0', 10);
    if (!name.trim()) return Alert.alert('Name required', 'Please enter a package name.');
    if (!(total > 0)) return Alert.alert('Sessions required', 'Number of sessions must be at least 1.');
    setSaving(true);
    try {
      if (pkg) {
        await trainerApi.updatePackage(pkg.id, { name: name.trim(), price: amount, total_sessions: total, notes: notes.trim() || null });
      } else {
        await trainerApi.createPackage(params.customerId, {
          pt_package_id: catalogId === 'custom' ? undefined : catalogId,
          name: name.trim(),
          price: amount,
          total_sessions: total,
          registration_date: date,
          is_paid: paid,
          notes: notes.trim() || undefined,
        });
      }
      nav.goBack();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={pkg ? 'Edit Package' : 'New Package'} subtitle={params.studentName} back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {!pkg ? (
            <>
              <Label>Package</Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {catalog.map((c) => (
                  <Chip key={c.id} label={c.name} selected={catalogId === c.id} onPress={() => choose(c)} />
                ))}
                <Chip label="Custom" selected={catalogId === 'custom'} onPress={() => choose('custom')} />
              </ScrollView>
            </>
          ) : null}

          <TextField label="Package name" value={name} onChangeText={setName} placeholder="e.g. 12 Sessions" />
          <TextField label="Price (IDR)" value={price} onChangeText={(t) => setPrice(digits(t))} keyboardType="number-pad" placeholder="0" />
          <TextField label="Total sessions" value={sessions} onChangeText={(t) => setSessions(digits(t))} keyboardType="number-pad" placeholder="12" />
          {!pkg ? <DateField label="Start date" value={date} onChange={setDate} /> : null}
          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />

          {!pkg ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Already paid</Text>
              <Switch value={paid} onValueChange={setPaid} trackColor={{ true: colors.primary, false: colors.borderStrong }} thumbColor="#fff" />
            </View>
          ) : null}

          <Button title={pkg ? 'Save changes' : 'Add package'} onPress={save} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
