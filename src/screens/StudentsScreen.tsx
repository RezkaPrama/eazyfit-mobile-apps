import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useAppDispatch, useAppSelector } from '../store';
import { loadStudents } from '../store/studentsSlice';
import { Header, HeaderButton } from '../components/Header';
import { EmptyState, ErrorState, Loading } from '../components/ui';
import { StudentCard } from '../components/StudentCard';
import { useRefreshOnFocus } from '../components/useRefreshOnFocus';

export default function StudentsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { items, loading, error, loaded } = useAppSelector((s) => s.students);
  const [q, setQ] = useState('');

  useRefreshOnFocus(() => { dispatch(loadStudents(q.trim() || undefined)); });

  // pencarian di server dengan jeda singkat
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(() => dispatch(loadStudents(q.trim() || undefined)), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header title="Students" right={<HeaderButton icon="person-add" filled onPress={() => nav.navigate('StudentForm')} />} />
      <View style={{ padding: 16, paddingBottom: 6 }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search students"
          placeholderTextColor={colors.faint}
          style={{ backgroundColor: colors.cardAlt, color: colors.text, borderRadius: 12, paddingHorizontal: 14, height: 46 }}
        />
      </View>
      {!loaded && loading ? (
        <Loading />
      ) : !loaded && error ? (
        <ErrorState message={error} onRetry={() => dispatch(loadStudents(undefined))} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(s) => String(s.customer_id)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(loadStudents(q.trim() || undefined))} tintColor={colors.link} />}
          ListEmptyComponent={
            <EmptyState icon="people-outline" title={q ? 'No matches' : 'No students yet'} subtitle={q ? undefined : 'Tap the + button to add your first student.'} />
          }
          renderItem={({ item }) => <StudentCard student={item} onPress={() => nav.navigate('StudentDetail', { customerId: item.customer_id })} />}
        />
      )}
    </View>
  );
}
