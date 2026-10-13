import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';

/** Header buatan sendiri agar sama dengan mockup (judul rata kiri, tombol kanan opsional). */
export const Header: React.FC<{
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}> = ({ title, subtitle, back, right }) => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      {back ? (
        <Pressable onPress={() => nav.goBack()} hitSlop={10} style={{ marginRight: 12 }}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
};

export const HeaderButton: React.FC<{ icon: keyof typeof Ionicons.glyphMap; onPress: () => void; filled?: boolean }> = ({
  icon, onPress, filled,
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={8}
    style={[styles.hb, filled && { backgroundColor: colors.primary }]}
  >
    <Ionicons name={icon} size={22} color={colors.text} />
  </Pressable>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.header, paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row',
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  hb: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
