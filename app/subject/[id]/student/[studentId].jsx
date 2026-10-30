import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../../../constant/colors';
import { Fredoka, Nunito } from '../../../../constant/fonts';
import { Students } from '../../../../Mocks/students';
import { Subjects } from '../../../../Mocks/subjects';

const RING_SIZE = 88;
const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function StudentPerformanceRoute() {
  const { id, studentId } = useLocalSearchParams();
  const subjectId = Array.isArray(id) ? id[0] : id;
  const selectedStudentId = Array.isArray(studentId) ? studentId[0] : studentId;
  const student = Students.find((item) => String(item.id) === String(selectedStudentId));
  const subject = Subjects.find((item) => String(item.id) === String(subjectId));

  if (!student) {
    return (
      <View style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.notFound}>Student not found.</Text>
      </View>
    );
  }

  const performance = student.performance ?? {};
  const lessonScores = performance.lessonScores ?? [];
  const overallScore = Number(performance.overallScore ?? 0);
  const initials = student.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const subjectName = subject?.name === 'Mathematics' ? 'Math' : subject?.name ?? 'Subject';
  const isAtRisk = String(student.status).toLowerCase().replace(/[\s_-]/g, '') === 'atrisk';

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to students"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Student performance</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.studentCard}>
          <View style={[styles.avatar, { backgroundColor: student.avatarColor || Colors.primarySoft }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.studentDetails}>
            <Text numberOfLines={1} style={styles.studentName}>{student.name}</Text>
            <Text numberOfLines={1} style={styles.studentMeta}>
              {subjectName} {subject?.grade ?? ''} • Level {student.level ?? 1} • {Number(student.exp ?? 0).toLocaleString()} EXP
            </Text>
            <View style={styles.studentBadges}>
              <View style={[styles.badge, isAtRisk ? styles.riskBadge : styles.trackBadge]}>
                <Text style={[styles.badgeText, isAtRisk ? styles.riskText : styles.trackText]}>
                  {isAtRisk ? 'At risk' : 'On track'}
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>{performance.streakDays ?? 0}-day streak</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.ringContainer} accessibilityLabel={`Overall performance ${overallScore}%`}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke={Colors.primarySoft}
                strokeWidth="9"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke={overallScore < 70 ? Colors.warning : Colors.success}
                strokeWidth="9"
                strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - Math.min(Math.max(overallScore, 0), 100) / 100)}
                strokeLinecap="round"
                rotation={-90}
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.ringLabel}>
              <Text style={styles.ringScore}>{overallScore}%</Text>
              <Text style={styles.ringCaption}>overall</Text>
            </View>
          </View>

          <View style={styles.overviewText}>
            <Text style={styles.sectionTitle}>Overall performance</Text>
            <Text style={styles.bodyText}>
              {overallScore < Number(performance.classAverage ?? 0)
                ? `Below the class average of ${performance.classAverage}%.`
                : `At or above the class average of ${performance.classAverage ?? 0}%.`}
            </Text>
            <Text style={styles.bodyText}>{performance.trendMessage ?? 'No recent trend available.'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <MetricCard
            label="Lessons done"
            value={`${performance.lessonsDone ?? 0} / ${performance.totalLessons ?? 0}`}
          />
          <MetricCard label="Avg. time" value={`${performance.averageTime ?? 0} min`} />
          <MetricCard label="Last active" value={performance.lastActive ?? 'Unknown'} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Lesson scores</Text>
          {lessonScores.map((lesson) => (
            <View key={lesson.id} style={styles.lessonScore}>
              <View style={styles.lessonHeader}>
                <Text numberOfLines={1} style={styles.lessonName}>{lesson.name}</Text>
                <Text style={[styles.lessonPercent, { color: scoreColor(lesson.score) }]}>
                  {lesson.score}%
                </Text>
              </View>
              <View style={styles.lessonTrack}>
                <View
                  style={[
                    styles.lessonFill,
                    { width: `${Math.min(Math.max(Number(lesson.score) || 0, 0), 100)}%`, backgroundColor: scoreColor(lesson.score) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.topicsRow}>
          <View style={[styles.topicCard, styles.strongCard]}>
            <Text style={styles.topicLabel}>Strongest topic</Text>
            <Text numberOfLines={2} style={styles.topicValue}>{performance.strongestTopic ?? 'Not available'}</Text>
          </View>
          <View style={[styles.topicCard, styles.needsWorkCard]}>
            <Text style={styles.topicLabel}>Needs work</Text>
            <Text numberOfLines={2} style={styles.topicValue}>{performance.needsWork ?? 'Not available'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({ label, value }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function scoreColor(score) {
  if (Number(score) >= 70) return Colors.success;
  if (Number(score) >= 50) return Colors.warning;
  return Colors.danger;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.neutralBg,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    borderRadius: 21,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 18,
  },
  content: {
    gap: 12,
    paddingBottom: 18,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  studentCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 78,
    padding: 11,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    flexShrink: 0,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: Colors.text,
    fontFamily: Nunito.extraBold,
    fontSize: 15,
  },
  studentDetails: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  studentName: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 16,
  },
  studentMeta: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  studentBadges: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  riskBadge: {
    backgroundColor: Colors.dangerBg,
  },
  trackBadge: {
    backgroundColor: Colors.successBg,
  },
  badgeText: {
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  riskText: {
    color: Colors.danger,
  },
  trackText: {
    color: Colors.success,
  },
  streakBadge: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  streakText: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  overviewCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 116,
    padding: 12,
  },
  ringContainer: {
    alignItems: 'center',
    height: RING_SIZE,
    justifyContent: 'center',
    width: RING_SIZE,
  },
  ringLabel: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  ringScore: {
    color: Colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 19,
  },
  ringCaption: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 9,
  },
  overviewText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  sectionTitle: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 14,
  },
  bodyText: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metricCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  metricValue: {
    color: Colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 16,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testScore: {
    color: Colors.danger,
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  answerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  answerCount: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  answerBar: {
    backgroundColor: '#F4B7BA',
    borderRadius: 4,
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
  answerCorrect: {
    backgroundColor: Colors.success,
  },
  answerWrong: {
    backgroundColor: '#F4B7BA',
  },
  subsectionTitle: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 11,
    marginTop: 2,
  },
  missedQuestion: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 6,
  },
  questionId: {
    backgroundColor: Colors.dangerBg,
    borderRadius: 6,
    color: Colors.danger,
    fontFamily: Nunito.bold,
    fontSize: 10,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  questionText: {
    color: Colors.text,
    flex: 1,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  lessonScore: {
    gap: 3,
  },
  lessonHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  lessonName: {
    color: Colors.text,
    flex: 1,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  lessonPercent: {
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  lessonTrack: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
  },
  lessonFill: {
    borderRadius: 4,
    height: '100%',
  },
  topicsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topicCard: {
    borderRadius: 10,
    flex: 1,
    gap: 3,
    minWidth: 0,
    padding: 9,
  },
  strongCard: {
    backgroundColor: Colors.successBg,
  },
  needsWorkCard: {
    backgroundColor: Colors.dangerBg,
  },
  topicLabel: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  topicValue: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  notFound: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 16,
    margin: 20,
  },
});