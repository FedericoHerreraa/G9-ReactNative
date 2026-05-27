import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, fonts } from '../constants/theme';

/**
 * Placeholder del joystick virtual.
 * TODO: implementar control con react-native-reanimated + gesture-handler
 */
export default function VirtualJoystick({ disabled = false, onMove }) {
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.outer}>
        <View style={styles.inner} />
      </View>
      <Text style={styles.hint}>
        {disabled ? 'Conectá el robot para usar el joystick' : 'Joystick (próximamente)'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  outer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.textMuted,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fonts.sizes.sm,
  },
});
