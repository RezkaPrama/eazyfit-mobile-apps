import { DarkTheme, Theme } from '@react-navigation/native';

// Warna diambil dari mockup (tema gelap).
export const colors = {
  bg: '#0E0E10',
  header: '#1A1A1C',
  card: '#1A1A1C',
  cardAlt: '#222327',
  border: '#222224',
  borderStrong: '#2E2F33',
  text: '#FFFFFF',
  muted: '#8E9097',
  faint: '#5C5E65',
  // primary: '#0177C1',
  primary: '#3EDFCF',
  primarySoft: '#1F1E2E',
  link: '#469FDB',
  selected: '#078FE5',
  success: '#34C77B',
  successBg: 'rgba(52,199,123,0.14)',
  warning: '#EAB308',
  warningBg: 'rgba(234,179,8,0.14)',
  danger: '#EF4444',
  dangerText: '#F87171',
  dangerBg: 'rgba(239,68,68,0.14)',
  dangerTrack: '#2B1517',
  track: '#26272B',
};

export const radius = { sm: 10, md: 14, lg: 18, pill: 999 };

export const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.header,
    text: colors.text,
    border: colors.border,
    primary: colors.link,
    notification: colors.danger,
  },
};
