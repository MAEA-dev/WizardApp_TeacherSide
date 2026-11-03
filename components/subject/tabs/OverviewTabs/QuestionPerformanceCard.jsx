import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../constants/colors';
import { Fredoka, Nunito } from '../../../../constants/fonts';
import { Shadows } from '../../../../constants/shadows';
export default function QuestionPerformanceCard({
  correctAnswers,
  totalAnswers,
  mostMissedQuestions,
  onSeeAllQuestions,
}) {
  const wrongAnswers = Math.max(totalAnswers - correctAnswers, 0);
  const correctPercentage = totalAnswers > 0
    ? Math.round((correctAnswers / totalAnswers) * 100)
    : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Questions answered correctly</Text>

      <View style={styles.answerSummary}>
        <Text style={styles.answerLabel}>All answers</Text>
        <Text style={styles.answerCount}>
          {correctAnswers} of {totalAnswers} correct ({correctPercentage}%)
        </Text>
      </View>

      <View
        style={styles.answerBar}
        accessible
        accessibilityLabel={`${correctAnswers} correct, ${wrongAnswers} wrong`}
      >
        <View
          style={[styles.correctSegment, { width: `${correctPercentage}%` }]}
        />
        <View
          style={[styles.wrongSegment, { width: `${100 - correctPercentage}%` }]}
        />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendItem}>
          <Text style={styles.correctLegend}>Correct </Text>
          {correctAnswers}
        </Text>
        <Text style={styles.legendItem}>
          <Text style={styles.wrongLegend}>Wrong </Text>
          {wrongAnswers}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Most missed questions</Text>
      {mostMissedQuestions.map((item) => {
        const incorrectPercentage = Math.min(Math.max(item.incorrectPercent, 0), 100);

        return (
          <View key={item.id ?? item.question} style={styles.question}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionText} numberOfLines={2}>
                {item.question}
              </Text>
              <Text style={styles.questionPercentage}>
                {incorrectPercentage}%
              </Text>
            </View>
            <View style={styles.questionBar}>
              <View
                style={[
                  styles.questionBarFill,
                  { width: `${incorrectPercentage}%` },
                ]}
              />
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        accessibilityRole="button"
        onPress={onSeeAllQuestions}
        style={styles.button}
      >
        <Text style={styles.buttonText}>See all questions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    marginTop: 10,
    padding: 15,
    ...Shadows.medium
  },
  title: {
    color: Colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 16,
    marginBottom: 8,
  },
  answerSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  answerLabel: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  answerCount: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  answerBar: {
    borderRadius: 4,
    flexDirection: 'row',
    height: 12,
    overflow: 'hidden',
  },
  correctSegment: {
    backgroundColor: Colors.success,
  },
  wrongSegment: {
    backgroundColor: '#F6B4B7',
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  legendItem: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  correctLegend: {
    color: Colors.success,
  },
  wrongLegend: {
    color: Colors.danger,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 12,
    marginBottom: 5,
    marginTop: 15,
  },
  question: {
    marginBottom: 7,
  },
  questionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  questionText: {
    color: Colors.text,
    flex: 1,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  questionPercentage: {
    color: Colors.danger,
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  questionBar: {
    backgroundColor: '#E4EDFC',
    borderRadius: 4,
    height: 10,
    overflow: 'hidden',
  },
  questionBarFill: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    height: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    borderRadius: 9,
    justifyContent: 'center',
    marginTop: 5,
    minHeight: 28,
  },
  buttonText: {
    color: Colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
});