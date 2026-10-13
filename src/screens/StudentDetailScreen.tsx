import React, { useCallback, useState } from 'react';
import { Alert, Linking, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import type { Package, Student } from '../types';
import * as trainerApi from '../services/trainerApi';
import { getErrorMessage } from '../utils/errors';
import { formatDateShort, formatIDR } from '../utils/format';
import { useAppDispatch } from '../store';
import { loadStudents } from '../store/studentsSlice';
import { Header, HeaderButton } from '../components/Header';
import { Avatar, Button, Card, ErrorState, Loading, PaidBadge, ProgressBar, SectionTitle } from '../components/ui';
import { useRefreshOnFocus } from '../components/useRefreshOnFocus';

export default function StudentDetailScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<NativeStackScreenProps<RootStackParamList, 'StudentDetail'>['route']>();
  const dispatch = useAppDispatch();
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setStudent(await trainerApi.fetchStudent(params.customerId));
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }, [params.customerId]);
  useRefreshOnFocus(() => { load(); });

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await load();
      dispatch(loadStudents(undefined));
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  };

  const removeStudent = () =>
    Alert.alert('Remove student', `Remove ${student?.name} from your students? Their data stays in the gym system.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await trainerApi.deleteStudent(params.customerId);
            dispatch(loadStudents(undefined));
            nav.goBack();
          } catch (e) {
            Alert.alert('Cannot remove', getErrorMessage(e));
          }
        },
      },
    ]);

  const removePackage = (p: Package) =>
    Alert.alert('Delete package', `Delete "${p.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => run(() => trainerApi.deletePackage(p.id)) },
    ]);

  if (!student) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Header title="Student" back />
        {error ? <ErrorState message={error} onRetry={load} /> : <Loading />}
      </View>
    );
  }

  const packages = student.packages ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Header
        title={student.name}
        back
        right={<HeaderButton icon="create-outline" onPress={() => nav.navigate('StudentForm', { student })} />}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.link} />}
      >
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={student.name} size={56} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{student.name}</Text>
              {student.phone ? (
                <Text style={{ color: colors.link, marginTop: 2 }} onPress={() => Linking.openURL(`tel:${student.phone}`)}>{student.phone}</Text>
              ) : null}
              {student.email ? <Text style={{ color: colors.muted, marginTop: 2 }}>{student.email}</Text> : null}
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Sessions left</Text>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{student.remaining_sessions_total}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Unpaid</Text>
              <Text style={{ color: student.unpaid_total > 0 ? colors.dangerText : colors.text, fontSize: 16, fontWeight: '800', marginTop: 3 }}>
                {formatIDR(student.unpaid_total)}
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <Button
            title="Schedule" icon="calendar" style={{ flex: 1, marginRight: 8 }}
            onPress={() => nav.navigate('NewSession', { studentId: student.customer_id })}
          />
          <Button
            title="Measurements" icon="body" variant="outline" style={{ flex: 1 }}
            onPress={() => nav.navigate('Measurements', { customerId: student.customer_id, studentName: student.name })}
          />
        </View>

        <SectionTitle
          right={
            <Text style={{ color: colors.link, fontWeight: '700' }}
              onPress={() => nav.navigate('PackageForm', { customerId: student.customer_id, studentName: student.name })}>
              + Add package
            </Text>
          }
        >
          Packages
        </SectionTitle>

        {packages.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Ionicons name="pricetag-outline" size={28} color={colors.faint} />
            <Text style={{ color: colors.muted, marginTop: 6 }}>No packages yet.</Text>
          </Card>
        ) : (
          packages.map((p) => {
            const paid = p.payment_status === 'paid';
            const low = p.status === 'active' && p.remaining_sessions <= 2;
            return (
              <Card key={p.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 }}>{p.name}</Text>
                  <PaidBadge paid={paid} />
                </View>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
                  {formatIDR(p.price)} · {p.registration_date ? formatDateShort(p.registration_date) : '—'} · {p.status}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 6 }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>Sessions left</Text>
                  <Text style={{ color: low ? colors.dangerText : colors.text, fontSize: 12, fontWeight: '700' }}>
                    {p.remaining_sessions} / {p.total_sessions}
                  </Text>
                </View>
                <ProgressBar value={p.remaining_sessions} total={p.total_sessions} danger={low} />
                {p.notes ? <Text style={{ color: colors.muted, fontSize: 12, marginTop: 10 }}>{p.notes}</Text> : null}
                <View style={{ flexDirection: 'row', marginTop: 12 }}>
                  <Button
                    title={paid ? 'Mark unpaid' : 'Mark paid'} variant={paid ? 'outline' : 'primary'}
                    style={{ flex: 1, marginRight: 8, minHeight: 40 }}
                    onPress={() => run(() => (paid ? trainerApi.unpayPackage(p.id) : trainerApi.payPackage(p.id)))}
                  />
                  <Button title="Edit" variant="outline" style={{ minHeight: 40, marginRight: 8 }}
                    onPress={() => nav.navigate('PackageForm', { customerId: student.customer_id, studentName: student.name, pkg: p })} />
                  <Button title="Delete" variant="danger" style={{ minHeight: 40 }} onPress={() => removePackage(p)} />
                </View>
              </Card>
            );
          })
        )}

        <Button title="Remove student" variant="ghost" onPress={removeStudent} style={{ marginTop: 16 }} />
      </ScrollView>
    </View>
  );
}
