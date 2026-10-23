
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constant/colors';

export default function ProgressBar({
  current = 0,
  total = 100,
  color = Colors.primary,
  backgroundColor = Colors.border,
  height = 6,
  style
}) {
  const progress =
    total > 0
      ? Math.min(Math.max(current / total, 0), 1) * 100
      : 0;

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor },
        style
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${progress}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 20,
  },
});
