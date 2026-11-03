import { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { getScoreDistribution } from '../../../../utils/scoreDistribution';
import { Colors } from '../../../../constants/colors';
import { Fredoka, Nunito } from '../../../../constants/fonts';

const CHART_HEIGHT = 180;
const CARD_PADDING = 5; 
const SPACING = 6;
const BAR_COUNT = 5;
const INSIDE_THRESHOLD = 34; 

export default function ScoreDistributionChart({ scores }) {
  const [width, setWidth] = useState(0);

  const dist = useMemo(() => getScoreDistribution(scores), [scores]);
  const maxValue = Math.max(...dist.map((d) => d.value), 1) + 1;

  const chartWidth = Math.max(width - CARD_PADDING * 2, 0);
  const barWidth = Math.floor(
    (chartWidth - SPACING * (BAR_COUNT + 1)) / BAR_COUNT
  );

  const data = useMemo(
    () =>
      dist.map((d) => {
       
        const barHeight = (d.value / maxValue) * (CHART_HEIGHT - 10);
        const inside = barHeight > INSIDE_THRESHOLD;

        return {
          value: d.value,
          label: d.label,
          frontColor:
            d.label === '0-59'
              ? '#E5484D'
              : d.label === '60-69'
                ? '#F59E0B'
                : Colors?.primary ?? '#1E6FFF',
          topLabelComponent: () =>
            d.value > 0 ? (
              <Text
                style={[
                  styles.topLabel,
                  inside
                    ? { color: '#fff', marginBottom: -22 }
                    : { color: '#1E293B', marginBottom: 6 }, 
                ]}
              >
                {d.value}
              </Text>
            ) : null,
        };
      }),
    [dist, maxValue]
  );

  
  const chartKey = `${width}-${maxValue}-${dist.map((d) => d.value).join(',')}`;

  const hasScores = scores?.length > 0;

  return (
    <View
      style={styles.card}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <Text style={styles.title}>Score Distribution (students)</Text>

      {!hasScores ? (
        <Text style={styles.empty}>No scores yet.</Text>
      ) : width > 0 ? (
        <BarChart
          key={chartKey}
          data={data}
          width={chartWidth}
          height={CHART_HEIGHT}
          barWidth={barWidth}
          spacing={SPACING}
          initialSpacing={SPACING}
          endSpacing={0}
          overflowTop={20}
          disableScroll
          hideYAxisText
          yAxisLabelWidth={0}
          hideOrigin
          barBorderTopLeftRadius={8}
          barBorderTopRightRadius={8}
          barBorderBottomLeftRadius={0}
          barBorderBottomRightRadius={0}
          isAnimated
          maxValue={maxValue}
          noOfSections={Math.min(maxValue, 5)}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#E2E8F0"
          rulesColor="#EEF2F7"
          xAxisLabelTextStyle={styles.axisText}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: CARD_PADDING },
  title: { fontSize: 13, fontFamily: Nunito.bold, marginBottom: 12 },
  topLabel: { fontSize: 11, fontFamily: Fredoka.medium },
  axisText: { fontSize: 11, color: Colors.text , fontFamily: Fredoka.medium},
  empty: { color: '#64748B', paddingVertical: 24, textAlign: 'center' },
});