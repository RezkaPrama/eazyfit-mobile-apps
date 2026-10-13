import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { Session } from '../types';
import { formatDayMonth, formatTime12 } from '../utils/format';
import { Card, StatusBadge } from './ui';

export const sessionTitle = (s: Session) =>
  s.students.length === 0 ? 'Session' : s.students.length === 1 ? s.students[0].name : `${s.students[0].name} +${s.students.length - 1}`;

export const SessionCard: React.FC<{ session: Session; showDate?: boolean; onPress: () => void }> = ({ session, showDate, onPress }) => (
  <Card onPress={onPress} style={{ marginBottom: 10, padding: 14 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 74 }}>
        <Text style={{ color: colors.link, fontWeight: '700' }}>{formatTime12(session.start_time)}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
          {showDate ? formatDayMonth(session.date) : `${session.duration_minutes} min`}
        </Text>
      </View>
      <View style={{ flex: 1, marginRight: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {session.is_group ? <Ionicons name="people" size={14} color={colors.muted} style={{ marginRight: 5 }} /> : null}
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, flexShrink: 1 }} numberOfLines={1}>
            {sessionTitle(session)}
          </Text>
        </View>
        {session.exercise_type ? (
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{session.exercise_type}</Text>
        ) : null}
      </View>
      <StatusBadge status={session.status} />
    </View>
  </Card>
);
