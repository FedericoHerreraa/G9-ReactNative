import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { colors, fonts, spacing } from '../constants/theme';

const BASE_SIZE = 200; 
const KNOB_SIZE = 72; 
const MAX_RADIUS = (BASE_SIZE - KNOB_SIZE) / 2; 

const MAX_VX = 0.6; 
const MAX_VYAW = 1.0; 
const DEAD_ZONE = 0.08; 

export default function VirtualJoystick({ disabled = false, onMove, onRelease }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const lastSent = useRef({ vx: 0, vyaw: 0 });

  const emitMove = useCallback(
    (dx, dy) => {
      if (!onMove) return;

      let nx = dx / MAX_RADIUS;
      let ny = dy / MAX_RADIUS;

      const mag = Math.sqrt(nx * nx + ny * ny);
      if (mag < DEAD_ZONE) {
        nx = 0;
        ny = 0;
      }

      const vx = +(-ny * MAX_VX).toFixed(3);
      const vyaw = +(nx * MAX_VYAW).toFixed(3);

      const prev = lastSent.current;
      if (Math.abs(vx - prev.vx) < 0.03 && Math.abs(vyaw - prev.vyaw) < 0.03) {
        return;
      }
      lastSent.current = { vx, vyaw };

      onMove(vx, 0, vyaw);
    },
    [onMove]
  );

  const handleRelease = useCallback(() => {
    lastSent.current = { vx: 0, vyaw: 0 };
    onRelease?.();
  }, [onRelease]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((e) => {
      let dx = e.translationX;
      let dy = e.translationY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_RADIUS) {
        const ratio = MAX_RADIUS / dist;
        dx *= ratio;
        dy *= ratio;
      }
      tx.value = dx;
      ty.value = dy;
      runOnJS(emitMove)(dx, dy);
    })
    .onEnd(() => {
      tx.value = 0;
      ty.value = 0;
      runOnJS(handleRelease)();
    })
    .onFinalize(() => {
      tx.value = 0;
      ty.value = 0;
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={pan}>
        <View style={[styles.base, disabled && styles.disabled]}>
          <View style={styles.crosshairV} />
          <View style={styles.crosshairH} />
          <Animated.View style={[styles.knob, knobStyle]} />
        </View>
      </GestureDetector>
      <Text style={styles.hint}>
        {disabled ? 'Conectá el robot para usar el joystick' : 'Arrastrá para conducir'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  base: {
    width: BASE_SIZE,
    height: BASE_SIZE,
    borderRadius: BASE_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.4,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.text,
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: '70%',
    backgroundColor: colors.border,
  },
  crosshairH: {
    position: 'absolute',
    height: 1,
    width: '70%',
    backgroundColor: colors.border,
  },
  hint: {
    color: colors.textMuted,
    fontSize: fonts.sizes.sm,
  },
});
