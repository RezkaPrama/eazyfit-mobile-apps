import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useAppDispatch, useAppSelector } from '../store';
import { loadEarnings } from '../store/dashboardSlice';
import { formatIDR, monthKeyTitle, monthShort } from '../utils/format';
import { Card, ErrorState, Loading, PaidBadge } from '../components/ui';

export default function EarningsSheet({ visible, onClose, currentMonth }: { visible: boolean; onClose: () => void; currentMonth: string }) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { earnings, earningsLoading, earningsError } = useAppSelector((s) => s.dashboard);
  const [month, setMonth] = useState(currentMonth);

  useEffect(() => {
    if (visible) {
      setMonth(currentMonth);
      dispatch(loadEarnings());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const active = earnings?.months.find((m) => m.month === month);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={onClose} />
      <View style={{ backgroundColor: colors.header, maxHeight: '85%', minHeight: '55%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', flex: 1 }}>Earnings</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        {earningsLoading && !earnings ? (
          <Loading />
        ) : earningsError && !earnings ? (
          <ErrorState message={earningsError} onRetry={() => dispatch(loadEarnings())} />
        ) : earnings ? (
          <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 0 }}>
            <View style={{ flexDirection: 'row', marginBottom: 14 }}>
              <Card style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>All-time collected</Text>
                <Text style={{ color: colors.success, fontWeight: '800', marginTop: 4 }}>{formatIDR(earnings.all_time_collected)}</Text>
              </Card>
              <Card style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Outstanding</Text>
                <Text style={{ color: colors.dangerText, fontWeight: '800', marginTop: 4 }}>{formatIDR(earnings.total_outstanding)}</Text>
              </Card>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {earnings.months.map((m) => {
                const on = m.month === month;
                return (
                  <Pressable
                    key={m.month}
                    onPress={() => setMonth(m.month)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, marginRight: 8,
                      backgroundColor: on ? colors.primary : colors.cardAlt,
                    }}
                  >
                    <Text style={{ color: on ? '#fff' : colors.muted, fontWeight: '700' }}>{monthShort(m.month)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {active ? (
              <>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{monthKeyTitle(active.month)}</Text>
                <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Collected</Text>
                    <Text style={{ color: colors.success, fontWeight: '800' }}>{formatIDR(active.collected)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Pending</Text>
                    <Text style={{ color: colors.dangerText, fontWeight: '800' }}>{formatIDR(active.pending)}</Text>
                  </View>
                </View>
                {active.items.length === 0 ? (
                  <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 20 }}>No packages sold this month.</Text>
                ) : (
                  active.items.map((it) => (
                    <View
                      key={it.pt_member_id}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}
                    >
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ color: colors.text, fontWeight: '600' }}>{it.student_name}</Text>
                        <Text style={{ color: colors.muted, fontSize: 12 }}>{it.package_name}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 4 }}>{formatIDR(it.price)}</Text>
                        <PaidBadge paid={it.payment_status === 'paid'} />
                      </View>
                    </View>
                  ))
                )}
              </>
            ) : null}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}
