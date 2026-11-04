import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DetailsHeader from './DetailsHeader';
import LessonProgress from './LessonProgress';
import ClassPerformance from './ClassPerformance';
import QuestionPerformanceCard from './QuestionPerformanceCard';
import { Colors } from '../../../../constants/colors';
import { Nunito } from '../../../../constants/fonts';
import {
  filterCompletionsByQuarter,
  getAnswerCounts,
  getCompletedLessonCount,
  getLessonIdsByQuarter,
  getMostMissedQuestions,
  getQuarter,
  getStudentAverageScores,
} from './overviewMetrics';

export default function OverviewTab({
  lessons = [],
  completions = [],
  gradeStudentCount,
  gradeCountError,
  isLoadingCompletions,
  completionsError,
}) {
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [isQuarterMenuVisible, setIsQuarterMenuVisible] = useState(false);

  const quarters = useMemo(
    () => [...new Set(lessons.map(getQuarter).filter(Boolean))].sort((a, b) => a - b),
    [lessons]
  );

  useEffect(() => {
    setSelectedQuarter((current) =>
      current === 'all' && quarters.includes(1)
        ? 1
        : current !== 'all' && !quarters.includes(current)
          ? 'all'
          : current
    );
  }, [quarters]);

  const lessonIdsByQuarter = useMemo(() => {
    return getLessonIdsByQuarter(lessons);
  }, [lessons]);

  const quarterCompletions = useMemo(() => {
    return filterCompletionsByQuarter(completions, lessonIdsByQuarter, selectedQuarter);
  }, [completions, lessonIdsByQuarter, selectedQuarter]);

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

  const completedLessons = useMemo(() => {
    return getCompletedLessonCount(lessons, completions, gradeStudentCount);
  }, [completions, gradeStudentCount, lessons]);

  const classAverage = scoreByStudent.length
    ? Math.round(scoreByStudent.reduce((sum, score) => sum + score, 0) / scoreByStudent.length)
    : null;
  const passedCount = scoreByStudent.filter((score) => score >= 70).length;
  const atRiskCount = scoreByStudent.filter((score) => score < 70).length;
  const quarterLabel =
    selectedQuarter === 'all' ? 'All quarters' : `Quarter ${selectedQuarter}`;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <DetailsHeader
        gradeStudentCount={gradeStudentCount}
        lessonCount={lessons.length}
        averageTime="—"
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

      {atRiskCount > 0 && (
        <View style={styles.riskBanner}>
          <View style={styles.riskCount}>
            <Text style={styles.riskCountText}>{atRiskCount}</Text>
          </View>
          <Text style={styles.riskText}>
            {atRiskCount} {atRiskCount === 1 ? 'student has' : 'students have'} a recorded average below 70%
          </Text>
        </View>
      )}

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
                  setSelectedQuarter(option.key);
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
  riskBanner: {
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  riskCount: {
    alignItems: 'center',
    backgroundColor: '#C81E1E',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  riskCountText: {
    color: Colors.surface,
    fontFamily: Nunito.extraBold,
    fontSize: 16,
  },
  riskText: {
    color: '#991B1B',
    flex: 1,
    fontFamily: Nunito.bold,
    fontSize: 12,
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
