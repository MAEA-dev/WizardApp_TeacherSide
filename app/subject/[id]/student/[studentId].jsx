import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { doc, getDoc } from 'firebase/firestore';
import { Colors } from '../../../../constants/colors';
import { Nunito } from '../../../../constants/fonts';
import { db } from '../../../../services/firebaseConfig';
import {
  subscribeToSubjectCompletions,
  subscribeToSubjectLessons,
} from '../../../../services/teacherClasses';
import {
  getCompletionTimestamp,
  INACTIVITY_THRESHOLD_DAYS,
  isStudentAtRisk,
  isStudentInactive,
} from '../../../../utils/studentActivity';
import { formatDurationSeconds } from '../../../../utils/formatDuration';

const getScorePercent = (completion) => {
  const percentage = Number(completion.percentage);
  if (
    completion.percentage !== null &&
    completion.percentage !== undefined &&
    completion.percentage !== '' &&
    Number.isFinite(percentage)
  ) return percentage;
  const correct = Number(completion.correctAnswers);
  const total = Number(completion.totalQuestions);
  return total > 0 && Number.isFinite(correct) ? Math.round((correct / total) * 100) : null;
};

const formatLastActive = (timestamp) => {
  if (timestamp === null) return '—';
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86400000));
  if (days === 0) return 'Today';
  return `${days} day${days === 1 ? '' : 's'}`;
};

const getInitials = (name) =>
  String(name || 'Student')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();

function PerformanceRing({ score }) {
  const size = 84;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = score === null ? 0 : Math.max(0, Math.min(score, 100)) / 100;

  return (
    <View style={styles.ring}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E1EAFB"
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={score !== null && score < 70 ? '#E98700' : '#244FDB'}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Text style={styles.ringScore}>{score === null ? '—' : `${score}%`}</Text>
        <Text style={styles.ringCaption}>overall</Text>
      </View>
    </View>
  );
}

export default function StudentPerformanceRoute() {
  const { id, studentId } = useLocalSearchParams();
  const subjectId = Array.isArray(id) ? id[0] : id;
  const selectedStudentId = Array.isArray(studentId) ? studentId[0] : studentId;
  const [student, setStudent] = useState(null);
  const [subject, setSubject] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [isLoadingCompletions, setIsLoadingCompletions] = useState(true);
  const [completionsError, setCompletionsError] = useState('');
  const [lessonsError, setLessonsError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    if (!selectedStudentId || !subjectId) {
      setError('Student or subject not found.');
      setIsLoading(false);
      return () => {
        isActive = false;
      };
    }

    setIsLoading(true);
    setError('');
    Promise.all([
      getDoc(doc(db, 'users', selectedStudentId)),
      getDoc(doc(db, 'subjects', subjectId)),
    ])
      .then(([studentSnapshot, subjectSnapshot]) => {
        if (!isActive) return;
        if (!studentSnapshot.exists() || !subjectSnapshot.exists()) {
          setError('Student or subject not found.');
          return;
        }

        const studentData = studentSnapshot.data();
        const profile = studentData.profile || {};
        setStudent({
          name: [profile.firstName, profile.lastName].filter(Boolean).join(' '),
          level: studentData.level,
          xp: studentData.xp,
          streak: studentData.streak,
        });
        const subjectData = subjectSnapshot.data();
        setSubject({
          name: subjectData.subjectName,
          grade: subjectData.gradeLevel,
        });
      })
      .catch((loadError) => {
        console.error('Unable to load student details:', loadError);
        if (isActive) setError(loadError.message || 'Unable to load student details.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedStudentId, subjectId]);

  useEffect(() => {
    if (!subjectId || !selectedStudentId) return undefined;

    setCompletions([]);
    setCompletionsError('');
    setIsLoadingCompletions(true);
    return subscribeToSubjectCompletions(
      subjectId,
      (subjectCompletions) => {
        setCompletions(subjectCompletions);
        setCompletionsError('');
        setIsLoadingCompletions(false);
      },
      (loadError) => {
        console.error('Unable to load student lesson performance:', loadError);
        setCompletionsError(loadError.message || 'Unable to load lesson performance.');
        setIsLoadingCompletions(false);
      }
    );
  }, [selectedStudentId, subjectId]);

  useEffect(() => {
    if (!subjectId) return undefined;

    return subscribeToSubjectLessons(
      subjectId,
      (subjectLessons) => {
        setLessons(subjectLessons);
        setLessonsError('');
      },
      (loadError) => {
        console.error('Unable to load student subject lessons:', loadError);
        setLessonsError(loadError.message || 'Unable to load subject lessons.');
      }
    );
  }, [subjectId]);

  const studentCompletions = useMemo(
    () => completions.filter((completion) => completion.studentId === selectedStudentId),
    [completions, selectedStudentId]
  );

  const lessonResults = useMemo(() => {
    const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
    const resultsByLesson = new Map();

    studentCompletions.forEach((completion) => {
      if (!completion.lessonId) return;
      const current = resultsByLesson.get(completion.lessonId);
      const currentTime = current ? getCompletionTimestamp(current.completedAt) : null;
      const nextTime = getCompletionTimestamp(completion.completedAt);
      if (!current || (nextTime !== null && (currentTime === null || nextTime >= currentTime))) {
        resultsByLesson.set(completion.lessonId, completion);
      }
    });

    return [...resultsByLesson.entries()]
      .map(([lessonId, completion]) => ({
        id: lessonId,
        title: lessonsById.get(lessonId)?.title || 'Untitled lesson',
        score: getScorePercent(completion),
        completion,
      }))
      .sort((a, b) => {
        if (a.score === null && b.score === null) return 0;
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return b.score - a.score;
      });
  }, [studentCompletions, lessons]);

  const averageScore = useMemo(() => {
    const scores = lessonResults.map(({ score }) => score).filter((score) => score !== null);
    return scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;
  }, [lessonResults]);

  const averageDurationSeconds = useMemo(() => {
    const durations = lessonResults
      .map(({ completion }) => completion.durationSeconds)
      .filter((duration) => duration !== null && duration !== undefined && duration !== '')
      .map(Number)
      .filter((duration) => Number.isFinite(duration) && duration >= 0);

    return durations.length
      ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
      : null;
  }, [lessonResults]);

  const classAverage = useMemo(() => {
    const scoresByStudent = new Map();
    completions.forEach((completion) => {
      const score = getScorePercent(completion);
      if (!completion.studentId || score === null) return;
      if (!scoresByStudent.has(completion.studentId)) scoresByStudent.set(completion.studentId, []);
      scoresByStudent.get(completion.studentId).push(score);
    });
    const studentAverages = [...scoresByStudent.values()].map(
      (scores) => scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
    return studentAverages.length
      ? Math.round(studentAverages.reduce((sum, score) => sum + score, 0) / studentAverages.length)
      : null;
  }, [completions]);

  const latestCompletionTime = useMemo(
    () => studentCompletions.reduce((latest, completion) => {
      const timestamp = getCompletionTimestamp(completion.completedAt);
      return timestamp === null ? latest : Math.max(latest ?? timestamp, timestamp);
    }, null),
    [studentCompletions]
  );

  const strongestLesson = lessonResults.find(({ score }) => score !== null);
  const needsWorkLesson = [...lessonResults].reverse().find(({ score }) => score !== null);
  const completionCount = lessonResults.length;
  const isInactive = isStudentInactive(latestCompletionTime);
  const isAtRisk = isStudentAtRisk(averageScore, latestCompletionTime);
  const hasStatus = averageScore !== null || isInactive;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Student performance</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={styles.centered} />
      ) : error ? (
        <Text style={styles.message}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.studentCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
            </View>
            <View style={styles.studentDetails}>
              <Text numberOfLines={1} style={styles.studentName}>{student.name || 'Student'}</Text>
              <Text numberOfLines={1} style={styles.subject}>
                {subject.name} {subject.grade}
                {student.level == null ? '' : ` · Level ${student.level}`}
                {student.xp == null ? '' : ` · ${Number(student.xp).toLocaleString()} EXP`}
              </Text>
              <View style={styles.studentBadges}>
                {hasStatus && (
                  <Text style={[styles.statusBadge, isAtRisk ? styles.atRiskBadge : styles.onTrackBadge]}>
                    {isAtRisk ? 'At risk' : 'On track'}
                  </Text>
                )}
                {student.streak != null && (
                  <Text style={styles.streakBadge}>{student.streak}-day streak</Text>
                )}
              </View>
            </View>
          </View>

          {isLoadingCompletions ? (
            <ActivityIndicator color={Colors.primary} style={styles.performanceState} />
          ) : completionsError ? (
            <Text style={styles.message}>{completionsError}</Text>
          ) : (
            <>
              <View style={styles.performanceCard}>
                <PerformanceRing score={averageScore} />
                <View style={styles.performanceDetails}>
                  <Text style={styles.cardTitle}>Overall performance</Text>
                  <Text style={styles.performanceText}>
                    {averageScore === null
                      ? 'Scores will appear when this student completes a lesson.'
                      : classAverage === null
                        ? 'Class average is not available yet.'
                        : `${averageScore >= classAverage ? 'Above' : 'Below'} the class average of ${classAverage}%.`}
                  </Text>
                  {hasStatus && (
                    <Text style={styles.performanceText}>
                      {averageScore !== null && averageScore < 70
                        ? 'Overall score is below 70%.'
                        : isInactive
                          ? `No activity in more than ${INACTIVITY_THRESHOLD_DAYS} days.`
                          : 'Overall score is on track.'}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.metrics}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Lessons done</Text>
                  <Text style={styles.metricValue}>{completionCount} / {lessons.length}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Avg. time</Text>
                  <Text numberOfLines={1} style={styles.metricValue}>
                    {averageDurationSeconds === null
                      ? '—'
                      : formatDurationSeconds(averageDurationSeconds)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Last active</Text>
                  <Text numberOfLines={1} style={styles.metricValue}>
                    {formatLastActive(latestCompletionTime)}
                  </Text>
                </View>
              </View>
              <Text style={styles.timeNote}>Average across completed lessons with recorded time.</Text>

              <View style={styles.lessonScoresCard}>
                <Text style={styles.cardTitle}>Lesson scores</Text>
                {lessonResults.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No completed lessons are recorded for this student in this subject.
                  </Text>
                ) : (
                  lessonResults.map((result, index) => {
                    const score = result.score;
                    const fillColor = score === null
                      ? '#94A3B8'
                      : score >= 70
                        ? '#16A34A'
                        : score >= 50
                          ? '#E98700'
                          : '#C62828';
                    return (
                      <View key={result.id} style={styles.lessonScore}>
                        <View style={styles.lessonScoreHeading}>
                          <Text numberOfLines={1} style={styles.lessonTitle}>
                            {index + 1}. {result.title}
                          </Text>
                          <Text style={[styles.lessonPercentage, { color: fillColor }]}>
                            {score === null ? '—' : `${score}%`}
                          </Text>
                        </View>
                        <View style={styles.progressTrack}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: fillColor,
                                width: `${score === null ? 0 : Math.max(0, Math.min(score, 100))}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })
                )}
                {!!lessonsError && <Text style={styles.errorText}>{lessonsError}</Text>}
              </View>

              {lessonResults.length > 1 && strongestLesson && needsWorkLesson && (
                <View style={styles.topicHighlights}>
                  <View style={[styles.topicCard, styles.strongestCard]}>
                    <Text style={styles.topicLabel}>Strongest topic</Text>
                    <Text numberOfLines={2} style={styles.topicValue}>{strongestLesson.title}</Text>
                  </View>
                  <View style={[styles.topicCard, styles.needsWorkCard]}>
                    <Text style={styles.topicLabel}>Needs work</Text>
                    <Text numberOfLines={2} style={styles.topicValue}>{needsWorkLesson.title}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EAF1FD',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#D5E5FF',
    borderRadius: 20,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 18,
  },
  centered: {
    flex: 1,
  },
  content: {
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 24,
  },
  studentCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: '#C8D9FF',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
    padding: 9,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#F3B1B4',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: Colors.text,
    fontFamily: Nunito.extraBold,
    fontSize: 14,
  },
  studentDetails: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  studentName: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 14,
  },
  studentBadges: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  subject: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  statusBadge: {
    borderRadius: 10,
    fontFamily: Nunito.bold,
    fontSize: 10,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  atRiskBadge: {
    backgroundColor: '#FEE2E2',
    color: '#A52323',
  },
  onTrackBadge: {
    backgroundColor: '#DCFCE7',
    color: '#13713B',
  },
  streakBadge: {
    backgroundColor: '#EFF4FF',
    borderRadius: 10,
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 9,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  performanceCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: '#C8D9FF',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 102,
    padding: 12,
  },
  ring: {
    alignItems: 'center',
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  ringLabel: {
    alignItems: 'center',
    position: 'absolute',
  },
  ringScore: {
    color: Colors.text,
    fontFamily: Nunito.extraBold,
    fontSize: 16,
  },
  ringCaption: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 8,
  },
  performanceDetails: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  cardTitle: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  performanceText: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    backgroundColor: Colors.surface,
    borderColor: '#C8D9FF',
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 9,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 9,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: Nunito.extraBold,
    fontSize: 16,
    marginTop: 2,
  },
  timeNote: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 9,
    marginTop: -7,
    textAlign: 'right',
  },
  lessonScoresCard: {
    backgroundColor: Colors.surface,
    borderColor: '#C8D9FF',
    borderRadius: 17,
    borderWidth: 1,
    gap: 9,
    padding: 10,
  },
  lessonScore: {
    gap: 4,
  },
  lessonScoreHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  lessonTitle: {
    color: Colors.text,
    flex: 1,
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  lessonPercentage: {
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  progressTrack: {
    backgroundColor: '#E2EAF8',
    borderRadius: 4,
    height: 5,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
    height: '100%',
  },
  emptyText: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
    paddingVertical: 12,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.danger,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  topicHighlights: {
    flexDirection: 'row',
    gap: 8,
  },
  topicCard: {
    borderRadius: 14,
    flex: 1,
    gap: 3,
    minWidth: 0,
    padding: 10,
  },
  strongestCard: {
    backgroundColor: '#DCFCE7',
  },
  needsWorkCard: {
    backgroundColor: '#FEE2E2',
  },
  topicLabel: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 9,
  },
  topicValue: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  message: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    lineHeight: 20,
    margin: 20,
    textAlign: 'center',
  },
  performanceState: {
    marginTop: 30,
  },
});
