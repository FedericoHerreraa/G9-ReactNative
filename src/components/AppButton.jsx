import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

export default function AppButton({ title, onPress, disabled = false, loading = false, variant = 'primary', theme }) {
  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? (theme?.primary ?? colors.surface) : 'transparent';
  const borderColor = isPrimary ? 'transparent' : (theme?.primary ?? colors.border);

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: bgColor, borderColor, opacity: (disabled || loading) ? 0.5 : 1 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading
        ? <ActivityIndicator size="small" color={colors.text} />
        : <Text style={styles.label}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  label: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: '600',
  },
});
