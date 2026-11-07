import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { AdminCard, AdminColors, AdminShell, AdminText } from '../../components/admin/AdminShell';
import { Inter } from '../../constants/fonts';
import { getAdminDashboard } from '../../services/adminService';

const METRICS = [
  { key: 'students', label: 'Total students' },
  { key: 'teachers', label: 'Total teachers' },
  { key: 'subjects', label: 'Total subjects' },
  { key: 'publishedLessons', label: 'Published lessons' },
];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((loadError) => {
        console.error('Unable to load admin dashboard:', loadError);
        if (active) setError(loadError.message || 'Unable to load dashboard data.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const settings = dashboard?.settings || {};
  const activeQuarter = Number(settings.activeQuarter) || 2;
  const quarterOpen = settings.configured && settings.quarters?.[activeQuarter]?.isOpen;
  const academicYear = String(settings.academicYear || '2026-2027').replace('-', '–');

  return (
    <AdminShell activeTab="home" title="Dashboard">
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AdminCard style={styles.yearCard}>
          <View style={styles.yearColumn}>
            <AdminText style={styles.label}>Academic year</AdminText>
            <AdminText style={styles.year}>{academicYear}</AdminText>
            <View style={styles.statusPill}>
              <AdminText style={styles.statusText}>Active</AdminText>
            </View>
          </View>
          <View style={styles.yearColumn}>
            <AdminText style={styles.label}>Active quarter</AdminText>
            <AdminText style={styles.year}>
              {settings.configured ? `Quarter ${activeQuarter}` : 'Not configured'}
            </AdminText>
            {settings.configured && (
              <View style={[styles.statusPill, !quarterOpen && styles.closedStatusPill]}>
                <AdminText style={[styles.statusText, !quarterOpen && styles.closedStatusText]}>
                  {quarterOpen ? 'Open' : 'Closed'}
                </AdminText>
              </View>
            )}
          </View>
        </AdminCard>

        {isLoading && <ActivityIndicator color={AdminColors.primary} />}
        {!!error && <AdminText accessibilityRole="alert" style={styles.error}>{error}</AdminText>}

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
  yearCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  yearColumn: {
    flex: 1,
  },
  label: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
  },
  year: {
    fontFamily: Inter.bold,
    fontSize: 17,
    marginTop: 1,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE8',
    borderRadius: 20,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#08785E',
    fontFamily: Inter.semiBold,
    fontSize: 11,
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
  closedStatusPill: {
    backgroundColor: '#FEE2E2',
  },
  closedStatusText: {
    color: '#B42318',
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
});
