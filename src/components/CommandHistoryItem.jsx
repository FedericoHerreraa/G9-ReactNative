import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, fonts } from '../constants/theme';

function formatTimestamp(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function CommandHistoryItem({ item }) {
  const success = item.success ?? (item.status !== 'error');
  const command = item.command ?? item.action ?? '—';
  const timestamp = formatTimestamp(item.timestamp ?? item.created_at);

  return (
    <View style={styles.row}>
      <Ionicons
        name={success ? 'checkmark-circle' : 'close-circle'}
        size={24}
        color={success ? colors.success : colors.error}
        style={styles.icon}
      />
      <View style={styles.content}>
        <Text style={styles.command}>{command}</Text>
        {timestamp ? <Text style={styles.time}>{timestamp}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
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
});
