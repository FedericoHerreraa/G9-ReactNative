import { useMemo, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '../constants/theme';

const BASE_SIZE = 200; 
const KNOB_SIZE = 72;
const MAX_RADIUS = (BASE_SIZE - KNOB_SIZE) / 2; 

const MAX_VX = 0.5; // avance/retroceso — eje vertical
const MAX_VYAW = 0.5; // giro — eje horizontal
const DEAD_ZONE = 0.08; 
const MIN_DELTA = 0.03; 

export default function VirtualJoystick({ disabled = false, onMove, onRelease }) {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastSent = useRef({ vx: 0, vyaw: 0 });

  const clampToCircle = (dx, dy) => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_RADIUS) {
      const ratio = MAX_RADIUS / dist;
      return { x: dx * ratio, y: dy * ratio };
    }
    return { x: dx, y: dy };
  };

  const emitMove = (dx, dy) => {
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
    if (Math.abs(vx - prev.vx) < MIN_DELTA && Math.abs(vyaw - prev.vyaw) < MIN_DELTA) {
      return;
    }
    lastSent.current = { vx, vyaw };

    onMove(vx, 0, vyaw);
  };

  const recenter = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5,
    }).start();
    lastSent.current = { vx: 0, vyaw: 0 };
    onRelease?.();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderMove: (_evt, gestureState) => {
          const pos = clampToCircle(gestureState.dx, gestureState.dy);
          pan.setValue(pos);
          emitMove(pos.x, pos.y);
        },
        onPanResponderRelease: recenter,
        onPanResponderTerminate: recenter,
      }),
    [disabled]
  );

  return (
    <View style={styles.wrapper}>
      <View style={[styles.base, disabled && styles.disabled]}>
        <View style={styles.crosshairV} />
        <View style={styles.crosshairH} />
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.knob,
            { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
          ]}
        />
      </View>
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
