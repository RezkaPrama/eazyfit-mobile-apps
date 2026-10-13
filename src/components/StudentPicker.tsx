import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import type { Student } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { loadStudents } from '../store/studentsSlice';
import { Avatar, EmptyState } from './ui';

/** Modal pemilih siswa (single / multi). */
export const StudentPicker: React.FC<{
  visible: boolean;
  multiple?: boolean;
  selected: number[];
  onClose: () => void;
  onDone: (students: Student[]) => void;
}> = ({ visible, multiple, selected, onClose, onDone }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { items, loaded } = useAppSelector((s) => s.students);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<number[]>(selected);

  useEffect(() => {
    if (visible) {
      setSel(selected);
      setQ('');
      if (!loaded) dispatch(loadStudents(undefined));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const list = items.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase()));

  const toggle = (s: Student) => {
    if (!multiple) {
      onDone([s]);
      return;
    }
    setSel((c) => (c.includes(s.customer_id) ? c.filter((x) => x !== s.customer_id) : [...c, s.customer_id]));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginLeft: 12, flex: 1 }}>Select student</Text>
          {multiple ? (
            <Pressable onPress={() => onDone(items.filter((s) => sel.includes(s.customer_id)))} hitSlop={10}>
              <Text style={{ color: colors.link, fontWeight: '700', fontSize: 16 }}>Done ({sel.length})</Text>
            </Pressable>
          ) : null}
        </View>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search students"
          placeholderTextColor={colors.faint}
          style={{
            backgroundColor: colors.cardAlt, color: colors.text, borderRadius: 12, marginHorizontal: 16,
            paddingHorizontal: 14, height: 46, marginBottom: 8,
          }}
        />
        <FlatList
          data={list}
          keyExtractor={(s) => String(s.customer_id)}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No students found" />}
          renderItem={({ item }) => {
            const on = sel.includes(item.customer_id);
            return (
              <Pressable
                onPress={() => toggle(item)}
                style={{
                  flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8,
                  backgroundColor: on ? colors.primarySoft : colors.card, borderWidth: 1,
                  borderColor: on ? colors.selected : colors.border,
                }}
              >
                <Avatar name={item.name} size={38} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {item.remaining_sessions_total} sessions left
                  </Text>
                </View>
                {multiple ? <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? colors.selected : colors.faint} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
};
