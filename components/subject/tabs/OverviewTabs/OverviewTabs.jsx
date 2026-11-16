import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DetailsHeader from './DetailsHeader';
import LessonProgress from './LessonProgress';
import ClassPerformance from './ClassPerformance';
import QuestionPerformanceCard from './QuestionPerformanceCard';
import { Colors } from '../../../../constants/colors';
import { Nunito } from '../../../../constants/fonts';
import { formatDurationSeconds } from '../../../../utils/formatDuration';
import {
  getAnswerCounts,
  getAverageDurationSeconds,
  getCompletedLessonCount,
  getMostMissedQuestions,
  getStudentAverageScores,
} from './overviewMetrics';

export default function OverviewTab({
  lessons = [],
  completions = [],
  quarterCompletions = [],
  quarters = [],
  selectedQuarter = 'all',
  onQuarterChange,
  gradeStudentCount,
  gradeCountError,
  isLoadingCompletions,
  completionsError,
}) {
  const [isQuarterMenuVisible, setIsQuarterMenuVisible] = useState(false);

  const scoreByStudent = useMemo(() => {
    return getStudentAverageScores(quarterCompletions);
  }, [quarterCompletions]);

  const { correctAnswerCount, totalAnswerCount } = useMemo(
    () => getAnswerCounts(quarterCompletions),
    [quarterCompletions]
  );

  const mostMissedQuestions = useMemo(() => {
    return getMostMissedQuestions(quarterCompletions);
  }, [quarterCompletions]);

  const averageTime = useMemo(
    () => formatDurationSeconds(getAverageDurationSeconds(quarterCompletions)),
    [quarterCompletions]
  );

  const completedLessons = useMemo(() => {
    return getCompletedLessonCount(lessons, completions, gradeStudentCount);
  }, [completions, gradeStudentCount, lessons]);

  const classAverage = scoreByStudent.length
    ? Math.round(scoreByStudent.reduce((sum, score) => sum + score, 0) / scoreByStudent.length)
    : null;
  const passedCount = scoreByStudent.filter((score) => score >= 70).length;
  const quarterLabel =
    selectedQuarter === 'all' ? 'All quarters' : `Quarter ${selectedQuarter}`;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <DetailsHeader
        gradeStudentCount={gradeStudentCount}
        lessonCount={lessons.length}
        averageTime={averageTime}
      />
      <LessonProgress
        totalLessons={lessons.length}
        finishedLessons={completedLessons}
      />

      <ClassPerformance
        classAvg={classAverage}
        passed={
          isLoadingCompletions
            ? `— / ${gradeStudentCount ?? '—'}`
            : Number.isInteger(gradeStudentCount)
              ? `${passedCount} / ${gradeStudentCount}`
              : `${passedCount}`
        }
        scores={scoreByStudent}
        quarterLabel={quarterLabel}
        onQuarterPress={() => setIsQuarterMenuVisible(true)}
      />

      <QuestionPerformanceCard
        correctAnswers={correctAnswerCount}
        totalAnswers={totalAnswerCount}
        mostMissedQuestions={mostMissedQuestions}
      />

      {!!gradeCountError && <Text style={styles.error}>{gradeCountError}</Text>}
      {!!completionsError && <Text style={styles.error}>{completionsError}</Text>}
      {!isLoadingCompletions && completions.length === 0 && (
        <Text style={styles.note}>Class performance will appear as students complete lessons.</Text>
      )}

      <Modal
        animationType="fade"
        transparent
        visible={isQuarterMenuVisible}
        onRequestClose={() => setIsQuarterMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close quarter selection"
            onPress={() => setIsQuarterMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.menu}>
            {[
              { key: 'all', label: 'All quarters' },
              ...quarters.map((quarter) => ({ key: quarter, label: `Quarter ${quarter}` })),
            ].map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedQuarter === option.key }}
                onPress={() => {
                  onQuarterChange?.(option.key);
                  setIsQuarterMenuVisible(false);
                }}
                style={[
                  styles.menuOption,
                  selectedQuarter === option.key && styles.menuOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.menuOptionText,
                    selectedQuarter === option.key && styles.menuOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#EAF1FD',
    flexGrow: 1,
    gap: 12,
    padding: 14,
    paddingBottom: 24,
  },
  note: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  error: {
    color: Colors.danger,
    fontFamily: Nunito.medium,
    fontSize: 12,
    textAlign: 'center',
  },
  menuOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
    flex: 1,
  },
  menu: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 8,
    padding: 5,
    position: 'absolute',
    right: 24,
    top: 300,
    width: 170,
  },
  menuOption: {
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  menuOptionSelected: {
    backgroundColor: Colors.primary,
  },
  menuOptionText: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  menuOptionTextSelected: {
    color: Colors.surface,
  },
});
