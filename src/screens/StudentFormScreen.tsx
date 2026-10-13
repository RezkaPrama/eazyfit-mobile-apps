import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { MemberSearchResult } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import { useAppDispatch } from '../store';
import { loadStudents } from '../store/studentsSlice';
import { Header } from '../components/Header';
import { Avatar, Button, Chip, TextField } from '../components/ui';

export default function StudentFormScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, 'StudentForm'>['route']>();
  const editing = params?.student;
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [name, setName] = useState(editing?.name ?? '');
  const [email, setEmail] = useState(editing?.email ?? '');
  const [phone, setPhone] = useState(editing?.phone ?? '');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== 'existing' || q.trim().length < 2) { setResults([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await trainerApi.searchMembers(q.trim());
        if (!cancelled) setResults(r);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, mode]);

  const finish = async () => {
    dispatch(loadStudents(undefined));
    nav.goBack();
  };

  const save = async () => {
    if (!name.trim()) return Alert.alert('Name required', 'Please enter the student name.');
    setSaving(true);
    try {
      if (editing) {
        await trainerApi.updateStudent(editing.customer_id, { name: name.trim(), email: email.trim() || null, phone: phone.trim() || null });
      } else {
        await trainerApi.createStudent({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
      }
      await finish();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const pick = async (m: MemberSearchResult) => {
    setSaving(true);
    try {
      await trainerApi.createStudent({ customer_id: m.customer_id });
      await finish();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title={editing ? 'Edit Student' : 'New Student'} back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {!editing ? (
            <View style={{ flexDirection: 'row', marginBottom: 18 }}>
              <Chip label="New" selected={mode === 'new'} onPress={() => setMode('new')} />
              <Chip label="Existing member" selected={mode === 'existing'} onPress={() => setMode('existing')} />
            </View>
          ) : null}

          {mode === 'new' || editing ? (
            <>
              <TextField label="Full name" value={name} onChangeText={setName} placeholder="e.g. Andi Pratama" />
              <TextField label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" />
              <TextField label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@example.com" />
              <Button title={editing ? 'Save changes' : 'Add student'} onPress={save} loading={saving} />
            </>
          ) : (
            <>
              <TextField label="Search gym members" value={q} onChangeText={setQ} placeholder="Name, phone or member code" autoCapitalize="none" />
              {searching ? <Text style={{ color: colors.muted, marginBottom: 8 }}>Searching…</Text> : null}
              {results.map((m) => (
                <Pressable
                  key={m.customer_id}
                  onPress={() => pick(m)}
                  disabled={saving}
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}
                >
                  <Avatar name={m.name} size={38} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{m.name}</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>{[m.phone, m.membership_code].filter(Boolean).join(' · ')}</Text>
                  </View>
                  <Text style={{ color: colors.link, fontWeight: '700' }}>Add</Text>
                </Pressable>
              ))}
              {!searching && q.trim().length >= 2 && results.length === 0 ? (
                <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 12 }}>No members found.</Text>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
