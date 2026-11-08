import { useCallback, useState } from 'react';
import { ActivityIndicator,  ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AdminCard, AdminColors, AdminShell, AdminText } from '../../components/admin/AdminShell';
import { Inter } from '../../constants/fonts';
import { getAdminDashboard } from '../../services/adminService';
 
const METRICS = [
  { key: 'students', label: 'Total students' },
  { key: 'teachers', label: 'Total teachers' },
  { key: 'subjects', label: 'Total subjects' },
  { key: 'publishedLessons', label: 'Published lessons' },
];
 
const BAR_MAX_HEIGHT = 80;
const REFRESH_MS = 15000; 
 
const plural = (count, singular, pluralForm) => (count === 1 ? singular : pluralForm);
 
export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
 
  const load = useCallback(async () => {
    try {
      const data = await getAdminDashboard();
      setDashboard(data);
      setError('');
    } catch (loadError) {
      console.error('Unable to load admin dashboard:', loadError);
      setError(loadError.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
   
    }
  }, []);
 
  
  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(load, REFRESH_MS);
      return () => clearInterval(timer);
    }, [load])
  );
 

 
  const activity = dashboard?.studentActivity || null;
  const weekly = dashboard?.weeklyLessons || null;
  const attention = dashboard?.attention || null;
  const totalStudents = dashboard?.metrics?.students ?? 0;
  const activeShare =
    activity && totalStudents > 0 ? Math.min(1, activity.activeWeek / totalStudents) : 0;
  const weeklyDays = weekly?.days || [];
  const weeklyMax = Math.max(1, ...weeklyDays.map((day) => day.count));
 
  const attentionItems = [];
  const noLessons = attention?.subjectsWithoutLessons;
  if (noLessons?.count > 0) {
    attentionItems.push({
      key: 'no-lessons',
      title: `${noLessons.count} ${plural(noLessons.count, 'subject has', 'subjects have')} no lessons`,
      detail: noLessons.names?.join(', '),
    });
  }
  const inactiveStudents = activity ? Math.max(0, totalStudents - activity.activeWeek) : 0;
  if (inactiveStudents > 0) {
    attentionItems.push({
      key: 'inactive',
      title: `${inactiveStudents} ${plural(inactiveStudents, 'student', 'students')} inactive for 7+ days`,
    });
  }
  const attentionAvailable = Boolean(attention || activity);
 
  return (
    <AdminShell activeTab="home" title="Dashboard">
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {isLoading && <ActivityIndicator color={AdminColors.primary} />}
        {!!error && <AdminText accessibilityRole="alert" style={styles.error}>{error}</AdminText>}
 
        <AdminCard style={styles.sectionCard}>
          <AdminText style={styles.cardTitle}>Needs attention</AdminText>
          {!attentionAvailable ? (
            <AdminText style={styles.helpText}>
              {isLoading ? 'Checking...' : 'Attention items are unavailable right now.'}
            </AdminText>
          ) : attentionItems.length === 0 ? (
            <View style={styles.clearRow}>
              <View style={[styles.dot, styles.clearDot]} />
              <AdminText style={styles.clearText}>All clear. Nothing needs attention.</AdminText>
            </View>
          ) : (
            attentionItems.map((item) => (
              <View key={item.key} style={styles.attentionRow}>
                <View style={[styles.dot, styles.warnDot]} />
                <View style={styles.attentionText}>
                  <AdminText style={styles.attentionTitle}>{item.title}</AdminText>
                  {!!item.detail && (
                    <AdminText style={styles.helpText} numberOfLines={2}>
                      {item.detail}
                    </AdminText>
                  )}
                </View>
              </View>
            ))
          )}
        </AdminCard>
 
        <View style={styles.metricGrid}>
          {METRICS.map(({ key, label }) => (
            <AdminCard key={key} style={styles.metricCard}>
              <AdminText style={styles.label}>{label}</AdminText>
              <AdminText style={styles.metricValue}>
                {dashboard?.metrics?.[key] ?? '—'}
              </AdminText>
            </AdminCard>
          ))}
        </View>
 
        <AdminCard style={styles.sectionCard}>
          <AdminText style={styles.cardTitle}>Student activity</AdminText>
          <View style={styles.activityRow}>
            <View style={styles.activityStat}>
              <AdminText style={styles.metricValue}>{activity?.activeToday ?? '—'}</AdminText>
              <AdminText style={styles.label}>Active today</AdminText>
            </View>
            <View style={styles.activityStat}>
              <AdminText style={styles.metricValue}>{activity?.activeWeek ?? '—'}</AdminText>
              <AdminText style={styles.label}>Active this week</AdminText>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(activeShare * 100)}%` }]} />
          </View>
          <AdminText style={styles.helpText}>
            {activity
              ? `${activity.activeWeek} of ${totalStudents} students were active in the last 7 days.`
              : isLoading
                ? 'Loading activity...'
                : 'Student activity is unavailable right now.'}
          </AdminText>
        </AdminCard>
 
        <AdminCard style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <AdminText style={styles.cardTitle}>Weekly uploaded lessons</AdminText>
            {weekly && (
              <AdminText style={styles.weekTotal}>{weekly.total} this week</AdminText>
            )}
          </View>
          {weeklyDays.length > 0 ? (
            <View style={styles.chart}>
              {weeklyDays.map((day) => (
                <View key={day.date} style={styles.barColumn}>
                  <AdminText style={styles.barCount}>{day.count}</AdminText>
                  <View style={styles.barSlot}>
                    <View
                      style={[
                        styles.bar,
                        day.isToday && styles.todayBar,
                        {
                          height: day.count
                            ? Math.max(6, (day.count / weeklyMax) * BAR_MAX_HEIGHT)
                            : 3,
                        },
                      ]}
                    />
                  </View>
                  <AdminText style={[styles.barLabel, day.isToday && styles.todayLabel]}>
                    {day.label}
                  </AdminText>
                </View>
              ))}
            </View>
          ) : (
            <AdminText style={styles.helpText}>
              {isLoading ? 'Loading lessons...' : 'Weekly lesson data is unavailable right now.'}
            </AdminText>
          )}
        </AdminCard>
 
        <AdminCard>
          <AdminText style={styles.cardTitle}>Admin controls</AdminText>
          <AdminText style={styles.helpText}>
            Manage the subjects teachers can use and the quarter currently shown to students.
          </AdminText>
        </AdminCard>
      </ScrollView>
    </AdminShell>
  );
}
 
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingBottom: 20,
  },
  label: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexBasis: '47%',
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  metricValue: {
    fontFamily: Inter.bold,
    fontSize: 24,
    lineHeight: 29,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 6,
  },
  helpText: {
    color: AdminColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: '#B42318',
    fontSize: 12,
  },
  sectionCard: {
    gap: 10,
  },
  attentionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  attentionText: {
    flex: 1,
  },
  attentionTitle: {
    fontFamily: Inter.semiBold,
    fontSize: 13,
  },
  clearRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  clearText: {
    color: '#08785E',
    fontFamily: Inter.semiBold,
    fontSize: 13,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  warnDot: {
    backgroundColor: '#F59E0B',
  },
  clearDot: {
    backgroundColor: '#08785E',
    marginTop: 0,
  },
  sectionHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekTotal: {
    color: AdminColors.primary,
    fontFamily: Inter.semiBold,
    fontSize: 12,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  activityStat: {
    flex: 1,
  },
  progressTrack: {
    backgroundColor: '#E9E4FF',
    borderRadius: 6,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: AdminColors.primary,
    borderRadius: 6,
    height: 8,
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  barSlot: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    alignSelf: 'center',
    backgroundColor: '#D4CCF6',
    borderRadius: 6,
    width: '70%',
  },
  todayBar: {
    backgroundColor: AdminColors.primary,
  },
  barCount: {
    fontFamily: Inter.semiBold,
    fontSize: 11,
  },
  barLabel: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 11,
  },
  todayLabel: {
    color: AdminColors.primary,
    fontFamily: Inter.semiBold,
  },
});