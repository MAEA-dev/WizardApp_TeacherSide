import React, { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PRESETS = {
  fadeIn: { opacity: 0, x: 0, y: 0, scale: 1 },
  slideUp: { opacity: 0, x: 0, y: 30, scale: 1 },
  slideDown: { opacity: 0, x: 0, y: -30, scale: 1 },
  slideLeft: { opacity: 0, x: 30, y: 0, scale: 1 },
  slideRight: { opacity: 0, x: -30, y: 0, scale: 1 },
  zoomIn: { opacity: 0, x: 0, y: 0, scale: 0.7 },
};

export default function AnimatedView({
  children,
  animation = 'fadeIn',
  duration = 500,
  delay = 0,
  useSpring = false,
  playKey = 0,
  hidden = false,
  style,
  ...props
}) {
  const preset = PRESETS[animation] || PRESETS.fadeIn;

  const opacity = useSharedValue(preset.opacity);
  const x = useSharedValue(preset.x);
  const y = useSharedValue(preset.y);
  const scale = useSharedValue(preset.scale);

  useEffect(() => {
    cancelAnimation(opacity);
    cancelAnimation(x);
    cancelAnimation(y);
    cancelAnimation(scale);

    opacity.value = preset.opacity;
    x.value = preset.x;
    y.value = preset.y;
    scale.value = preset.scale;

    
    if (hidden) return;

    const animate = (value) =>
      useSpring
        ? withSpring(value)
        : withTiming(value, {
            duration,
            easing: Easing.out(Easing.ease),
          });

    opacity.value = withDelay(delay, animate(1));
    x.value = withDelay(delay, animate(0));
    y.value = withDelay(delay, animate(0));
    scale.value = withDelay(delay, animate(1));

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(scale);
    };
  }, [playKey, animation, duration, delay, useSpring, hidden]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View {...props} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
