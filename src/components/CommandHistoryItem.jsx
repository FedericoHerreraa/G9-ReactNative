import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, fonts } from '../constants/theme';

export default function CommandHistoryItem({ item }) {
  const timestamp = item.timestamp ?? item.created_at ?? '';
  const command = item.command ?? item.action ?? '—';
  const status = item.status ?? 'ok';

  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <Text style={styles.command}>{command}</Text>
        {timestamp ? <Text style={styles.time}>{String(timestamp)}</Text> : null}
      </View>
      <View
        style={[
          styles.statusPill,
          status === 'error' ? styles.statusError : styles.statusOk,
        ]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
  command: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
  time: {
    color: colors.textMuted,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  statusOk: {
    backgroundColor: `${colors.success}33`,
  },
  statusError: {
    backgroundColor: `${colors.error}33`,
  },
  statusText: {
    color: colors.text,
    fontSize: fonts.sizes.sm,
    textTransform: 'capitalize',
  },
});
