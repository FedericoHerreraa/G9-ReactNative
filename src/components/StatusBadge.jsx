import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, fonts } from '../constants/theme';

const STATUS_CONFIG = {
  connected: { label: 'Conectado', color: colors.success },
  disconnected: { label: 'Desconectado', color: colors.textMuted },
  error: { label: 'Error', color: colors.error },
  connecting: { label: 'Conectando…', color: colors.warning },
};

export default function StatusBadge({ status = 'disconnected' }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;

  return (
    <View style={[styles.badge, { borderColor: config.color }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
});
