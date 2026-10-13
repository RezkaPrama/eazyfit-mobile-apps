import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import type { Student } from '../types';
import { Avatar, Card, PaidBadge, ProgressBar } from './ui';

export const StudentCard: React.FC<{ student: Student; onPress: () => void }> = ({ student, onPress }) => {
  const p = student.current_package;
  const low = !!p && p.remaining_sessions <= 2;
  return (
    <Card onPress={onPress} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={student.name} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{student.name}</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }} numberOfLines={1}>
            {p ? p.name : 'No package yet'}
          </Text>
        </View>
        {p ? <PaidBadge paid={student.unpaid_total <= 0} /> : null}
      </View>
      {p ? (
        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Sessions left</Text>
            <Text style={{ color: low ? colors.dangerText : colors.text, fontSize: 12, fontWeight: '700' }}>
              {p.remaining_sessions} / {p.total_sessions}
            </Text>
          </View>
          <ProgressBar value={p.remaining_sessions} total={p.total_sessions} danger={low} />
        </View>
      ) : null}
    </Card>
  );
};
