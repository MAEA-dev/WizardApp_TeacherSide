import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../constants/colors';
import { Nunito } from '../../../../constants/fonts';

const AVATAR_COLORS = ['#9FC2F8', '#A8DEC1', '#FFD08F', '#F3B1B4', '#CDBCF3'];

export default function StudentCard({ student, onPress }) {
  const name = student.name || 'Student';
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const isAtRisk = String(student.status).toLowerCase().replace(/[\s_-]/g, '') === 'atrisk';
  const score = Number.isFinite(student.averageScore) ? student.averageScore : null;
  const progressValue = Number(student.progress) || 0;
  const progress = Math.min(Math.max(progressValue > 1 ? progressValue / 100 : progressValue, 0), 1);
  const hasStatus = Boolean(student.status);
  const avatarColor = student.avatarColor || AVATAR_COLORS[
    [...String(student.id || name)].reduce((sum, character) => sum + character.charCodeAt(0), 0)
      % AVATAR_COLORS.length
  ];
  const meta = [
    score === null ? 'Total average —' : `Total average ${score}%`,
    `${student.completedLessonCount ?? 0} lessons finished`,
  ].join(' • ');
  const progressLabel = `Lesson completion progress ${Math.round(progress * 100)}%`;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${name}${meta ? `, ${meta}` : ''}${score == null ? '' : `, average score ${score}%`}${hasStatus ? `, ${isAtRisk ? 'at risk' : 'on track'}` : ''}`}
      onPress={onPress}
      style={styles.card}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={styles.name}>{name}</Text>
          {hasStatus && (
            <View style={[styles.status, isAtRisk ? styles.atRiskStatus : styles.onTrackStatus]}>
              <Text style={[styles.statusText, isAtRisk ? styles.atRiskText : styles.onTrackText]}>
                {isAtRisk ? 'At risk' : 'On track'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.meta}>{meta}</Text>

        <View
          accessibilityRole="progressbar"
          accessibilityLabel={progressLabel}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          style={styles.progressTrack}
        >
          {score !== null && (
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderColor: '#B7CEFF',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 11,
    marginBottom: 12,
    minHeight: 76,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 24,
    flexShrink: 0,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  initials: {
    color: Colors.text,
    fontFamily: Nunito.extraBold,
    fontSize: 15,
  },
  details: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  name: {
    color: Colors.text,
    flex: 1,
    fontFamily: Nunito.bold,
    fontSize: 14,
    minWidth: 0,
  },
  status: {
    borderRadius: 12,
    flexShrink: 0,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  onTrackStatus: {
    backgroundColor: Colors.successBg,
  },
  atRiskStatus: {
    backgroundColor: Colors.dangerBg,
  },
  statusText: {
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  onTrackText: {
    color: Colors.success,
  },
  atRiskText: {
    color: Colors.danger,
  },
  meta: {
    color: Colors.text,
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  progressTrack: {
    backgroundColor: '#E0EAFB',
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#244FDB',
    borderRadius: 4,
    height: '100%',
  },
});