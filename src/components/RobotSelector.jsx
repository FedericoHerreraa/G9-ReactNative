import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ROBOT_TYPES, colors, getRobotTheme, spacing, fonts } from '../constants/theme';

const ROBOTS = [
  {
    type: ROBOT_TYPES.GO2,
    label: 'Unitree Go2',
    icon: 'dog-side',
    description: 'Cuadrúpedo',
  },
  {
    type: ROBOT_TYPES.G1,
    label: 'Unitree G1',
    icon: 'human-male',
    description: 'Humanoide',
  },
];

export default function RobotSelector({ value, onChange }) {
  return (
    <View style={styles.container}>
      {ROBOTS.map((robot) => {
        const selected = value === robot.type;
        const theme = getRobotTheme(robot.type);

        return (
          <Pressable
            key={robot.type}
            onPress={() => onChange(robot.type)}
            style={[
              styles.card,
              selected && {
                borderColor: theme.primary,
                backgroundColor: `${theme.primary}22`,
              },
            ]}>
            <MaterialCommunityIcons
              name={robot.icon}
              size={36}
              color={selected ? theme.primary : colors.textMuted}
            />
            <Text style={[styles.label, selected && { color: theme.primary }]}>
              {robot.label}
            </Text>
            <Text style={styles.description}>{robot.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: fonts.sizes.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: fonts.sizes.sm,
  },
});
