import React from 'react';
import {
  ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { initials } from '../utils/format';
import type { SessionStatus } from '../types';

export const Card: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }> = ({
  children, style, onPress,
}) =>
  onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );

export const Button: React.FC<{
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}> = ({ title, onPress, variant = 'primary', loading, disabled, icon, style }) => {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.dangerBg : 'transparent';
  const fg = variant === 'danger' ? colors.dangerText : variant === 'ghost' ? colors.link : colors.text;
  const border = variant === 'outline' ? colors.borderStrong : variant === 'danger' ? colors.danger : 'transparent';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn, { backgroundColor: bg, borderColor: border }, (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 }, style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 6 }} /> : null}
          <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
};

export const Chip: React.FC<{ label: string; selected?: boolean; onPress?: () => void }> = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
  >
    <Text style={[styles.chipText, selected && { color: colors.text }]}>{label}</Text>
  </Pressable>
);

const STATUS: Record<SessionStatus, { label: string; fg: string; bg: string }> = {
  scheduled: { label: 'Scheduled', fg: colors.link, bg: 'rgba(70,159,219,0.14)' },
  completed: { label: 'Completed', fg: colors.success, bg: colors.successBg },
  cancelled: { label: 'Cancelled', fg: colors.dangerText, bg: colors.dangerBg },
  no_show: { label: 'No Show', fg: colors.warning, bg: colors.warningBg },
};
export const statusLabel = (s: SessionStatus) => STATUS[s].label;

export const Badge: React.FC<{ label: string; fg: string; bg: string }> = ({ label, fg, bg }) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
  </View>
);

export const StatusBadge: React.FC<{ status: SessionStatus }> = ({ status }) => (
  <Badge label={STATUS[status].label} fg={STATUS[status].fg} bg={STATUS[status].bg} />
);

export const PaidBadge: React.FC<{ paid: boolean }> = ({ paid }) =>
  paid ? (
    <Badge label="Paid" fg={colors.success} bg={colors.successBg} />
  ) : (
    <Badge label="Unpaid" fg={colors.dangerText} bg={colors.dangerBg} />
  );

export const ProgressBar: React.FC<{ value: number; total: number; danger?: boolean }> = ({ value, total, danger }) => {
  const pct = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  return (
    <View style={[styles.track, danger && { backgroundColor: colors.dangerTrack }]}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: danger ? colors.danger : colors.primary, borderRadius: 4 }} />
    </View>
  );
};

export const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 44 }) => (
  <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
    <Text style={{ color: colors.link, fontWeight: '700', fontSize: size * 0.36 }}>{initials(name)}</Text>
  </View>
);

export const Loading: React.FC = () => (
  <View style={styles.center}>
    <ActivityIndicator color={colors.link} size="large" />
  </View>
);

export const EmptyState: React.FC<{ icon?: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }> = ({
  icon = 'file-tray-outline', title, subtitle,
}) => (
  <View style={styles.center}>
    <Ionicons name={icon} size={40} color={colors.faint} />
    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 10 }}>{title}</Text>
    {subtitle ? <Text style={{ color: colors.muted, marginTop: 4, textAlign: 'center' }}>{subtitle}</Text> : null}
  </View>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <View style={styles.center}>
    <Ionicons name="cloud-offline-outline" size={40} color={colors.faint} />
    <Text style={{ color: colors.muted, marginVertical: 10, textAlign: 'center' }}>{message}</Text>
    {onRetry ? <Button title="Try again" variant="outline" onPress={onRetry} /> : null}
  </View>
);

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => <Text style={styles.label}>{children}</Text>;

export const TextField: React.FC<TextInputProps & { label?: string; error?: string | null }> = ({ label, error, style, ...rest }) => (
  <View style={{ marginBottom: 14 }}>
    {label ? <Label>{label}</Label> : null}
    <TextInput
      placeholderTextColor={colors.faint}
      {...rest}
      style={[styles.input, rest.multiline && { height: 90, textAlignVertical: 'top' }, error ? { borderColor: colors.danger } : null, style]}
    />
    {error ? <Text style={{ color: colors.dangerText, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
  </View>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; right?: React.ReactNode }> = ({ children, right }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
    <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{children}</Text>
    {right}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16,
  },
  btn: {
    minHeight: 48, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '700' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1,
    borderColor: colors.borderStrong, backgroundColor: colors.cardAlt, marginRight: 8,
  },
  chipText: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  track: { height: 6, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' },
  avatar: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.cardAlt, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong,
    color: colors.text, paddingHorizontal: 14, height: 48, fontSize: 15,
  },
});
