import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Opacity } from '../../constants/colors';
import { Fredoka, Nunito } from '../../constants/fonts';
import ProgressBar from '../other/ProgressBar';
import { subscribeToSubjectCardMetrics } from '../../services/teacherClasses';

const EMPTY_METRICS = {
  studentCount: null,
  lessonCount: null,
  finishedLessonCount: null,
};

export default function SubjectCard({
  id,
  subjectName,
  grade,
  color = Colors.primary,
}) {
  const router = useRouter();
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [metricsError, setMetricsError] = useState('');

  useEffect(() => {
    setMetrics(EMPTY_METRICS);
    setMetricsError('');

    try {
      return subscribeToSubjectCardMetrics(
        id,
        grade,
        setMetrics,
        (error) => {
          console.error('Unable to load subject card metrics:', error);
          setMetricsError('Some class metrics could not be loaded.');
        }
      );
    } catch (error) {
      console.error('Unable to subscribe to subject card metrics:', error);
      setMetricsError(error.message || 'Unable to load class metrics.');
      return undefined;
    }
  }, [grade, id]);

  return (
    <View style={[styles.card, { borderColor: `${color}${Opacity[20]}` }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}${Opacity[40]}` }]}>
          <Image
            source={require('../../assets/subjectIcon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.titleBox}>
          <Text style={[styles.subjectName, styles.capitalizeSubject]} numberOfLines={1}>
            {subjectName}
          </Text>
          <Text style={[styles.grade, { color }]} numberOfLines={1}>
            Grade {grade}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/subject/[id]',
              params: {
                id: String(id),
                subjectName,
                grade: String(grade),
              },
            })
          }
          style={styles.openButton}
        >
          <Text style={styles.openText}>Open</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <View style={[styles.stat, { backgroundColor: `${color}${Opacity[20]}` }]}>
          <Text style={styles.statLabel}>Students </Text>
          <Text style={styles.statValue}>
            {metrics.studentCount == null ? '—' : metrics.studentCount}
          </Text>
        </View>
        <View style={[styles.stat, { backgroundColor: `${color}${Opacity[20]}` }]}>
          <Text style={styles.statLabel}>Lessons</Text>
          <Text style={styles.statValue}>
            {metrics.lessonCount == null ? '—' : metrics.lessonCount}
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressTitle}>Lessons finished by all students</Text>
          <Text style={styles.progressValue}>
            {metrics.lessonCount == null
              ? '—'
              : `${metrics.finishedLessonCount ?? '—'} of ${metrics.lessonCount}`}
          </Text>
        </View>
        <ProgressBar
          current={metrics.finishedLessonCount ?? 0}
          total={metrics.lessonCount ?? 0}
          color={color}
          backgroundColor={Colors.border}
          height={6}
        />
      </View>

      {!!metricsError && <Text style={styles.error}>{metricsError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 10,
    marginVertical: 9,
    padding: 11,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 15,
    height: 66,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 66,
  },
  icon: {
    height: '90%',
    width: '90%',
  },
  titleBox: {
    flex: 1,
    minWidth: 0,
  },
  subjectName: {
    color: Colors.text,
    fontFamily: Nunito.extraBold,
    fontSize: 21,
    fontStyle: 'capitalize',
  },
  capitalizeSubject: {
    textTransform: 'capitalize',
  },
  grade: {
    fontFamily: Nunito.medium,
    fontSize: 16,
  },
  openButton: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 17,
    justifyContent: 'center',
    minHeight: 54,
    minWidth: 72,
    paddingHorizontal: 11,
  },
  openText: {
    color: Colors.surface,
    fontFamily: Fredoka.semiBold,
    fontSize: 17,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  stat: {
    borderRadius: 17,
    flex: 1,
    minHeight: 67,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statLabel: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 14,
  },
  statValue: {
    color: '#111827',
    fontFamily: Fredoka.semiBold,
    fontSize: 23,
    lineHeight: 27,
  },
  progressSection: {
    marginTop: 12,
    paddingHorizontal: 5,
  },
  progressLabels: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    color: Colors.textMuted,
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  progressValue: {
    color: Colors.textMuted,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  error: {
    color: Colors.danger,
    fontFamily: Nunito.medium,
    fontSize: 11,
    marginTop: 6,
  },
});
