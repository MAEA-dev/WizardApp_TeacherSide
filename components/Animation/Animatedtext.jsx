
import React, { useEffect } from 'react';
import { Text } from 'react-native';
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
  slideUp: { opacity: 0, x: 0, y: 25, scale: 1 },
  slideDown: { opacity: 0, x: 0, y: -25, scale: 1 },
  slideLeft: { opacity: 0, x: 25, y: 0, scale: 1 },
  slideRight: { opacity: 0, x: -25, y: 0, scale: 1 },
  zoomIn: { opacity: 0, x: 0, y: 0, scale: 0.7 },
};

const AnimatedRNText = Animated.createAnimatedComponent(Text);

export default function AnimatedText({
  children,
  animation = 'fadeIn',
  duration = 500,
  delay = 0,
  useSpring = false,
  playKey = 0,
  enabled = true,
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

    if (!enabled) {
      opacity.value = 1;
      x.value = 0;
      y.value = 0;
      scale.value = 1;
      return;
    }

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
  }, [playKey, animation, duration, delay, useSpring, enabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <AnimatedRNText
      {...props}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedRNText>
  );
}
