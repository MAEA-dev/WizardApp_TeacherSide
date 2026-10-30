import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../constant/colors';
import { Nunito } from '../../../../constant/fonts';

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
  const progressValue = Number(student.progress) || 0;
  const progress = Math.min(Math.max(progressValue > 1 ? progressValue / 100 : progressValue, 0), 1);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${name}, level ${student.level ?? 1}, ${isAtRisk ? 'at risk' : 'on track'}`}
      onPress={onPress}
      style={styles.card}
    >
      <View style={[styles.avatar, { backgroundColor: student.avatarColor || Colors.primarySoft }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.heading}>
          <Text numberOfLines={1} style={styles.name}>{name}</Text>
          <View style={[styles.status, isAtRisk ? styles.atRiskStatus : styles.onTrackStatus]}>
            <Text style={[styles.statusText, isAtRisk ? styles.atRiskText : styles.onTrackText]}>
              {isAtRisk ? 'At risk' : 'On track'}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          Level {student.level ?? 1} • {Number(student.exp ?? 0).toLocaleString()} EXP
        </Text>

        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
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
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 22,
    flexShrink: 0,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  initials: {
    color: Colors.text,
    fontFamily: Nunito.extraBold,
    fontSize: 14,
  },
  details: {
    flex: 1,
    gap: 2,
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
    fontSize: 15,
    minWidth: 0,
  },
  status: {
    borderRadius: 10,
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  onTrackStatus: {
    backgroundColor: Colors.successBg,
  },
  atRiskStatus: {
    backgroundColor: Colors.dangerBg,
  },
  statusText: {
    fontFamily: Nunito.bold,
    fontSize: 11,
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
    fontSize: 12,
  },
  progressTrack: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 4,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: '#3657A7',
    borderRadius: 4,
    height: '100%',
  },
});