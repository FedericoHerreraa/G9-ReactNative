import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, fonts } from '../constants/theme';

const STATUS_CONFIG = {
  connected: { label: 'Conectado', color: colors.success },
  disconnected: { label: 'Desconectado', color: colors.textMuted },
  error: { label: 'Error', color: colors.error },
  connecting: { label: 'Conectando…', color: colors.warning },
};

export default function StatusBadge({ status = 'disconnected', compact = false }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected;
  const isConnecting = status === 'connecting';

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { borderColor: config.color },
      ]}>
      {isConnecting ? (
        <ActivityIndicator size="small" color={config.color} />
      ) : (
        <View style={[styles.dot, compact && styles.dotCompact, { backgroundColor: config.color }]} />
      )}
      <Text style={[styles.label, compact && styles.labelCompact, { color: config.color }]}>
        {config.label}
      </Text>
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
  badgeCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCompact: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: fonts.sizes.sm,
  },
});
