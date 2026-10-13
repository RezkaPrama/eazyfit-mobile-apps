import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors } from '../theme';
import { formatDateShort, formatTime12, hhmmToDate, parseYMD, toHHMM, toYMD } from '../utils/format';
import { Label } from './ui';

export const DateField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <Row
    label={label}
    text={formatDateShort(value)}
    onPress={() =>
      DateTimePickerAndroid.open({
        value: parseYMD(value),
        mode: 'date',
        onChange: (e, d) => {
          if (e.type === 'set' && d) onChange(toYMD(d));
        },
      })
    }
  />
);

export const TimeField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <Row
    label={label}
    text={formatTime12(value)}
    onPress={() =>
      DateTimePickerAndroid.open({
        value: hhmmToDate(value),
        mode: 'time',
        is24Hour: false,
        onChange: (e, d) => {
          if (e.type === 'set' && d) onChange(toHHMM(d));
        },
      })
    }
  />
);

const Row: React.FC<{ label: string; text: string; onPress: () => void }> = ({ label, text, onPress }) => (
  <View style={{ marginBottom: 14 }}>
    <Label>{label}</Label>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{text}</Text>
      <Pressable onPress={onPress} hitSlop={8}>
        <Text style={{ color: colors.link, fontWeight: '700' }}>Change</Text>
      </Pressable>
    </View>
  </View>
);
