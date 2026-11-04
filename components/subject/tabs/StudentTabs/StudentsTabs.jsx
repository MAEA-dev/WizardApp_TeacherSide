import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../constants/colors';
import { Nunito } from '../../../../constants/fonts';
import StudentCard from './StudentCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'onTrack', label: 'On track' },
  { key: 'atRisk', label: 'At risk' },
];

const isAtRisk = (student) =>
  String(student.status).toLowerCase().replace(/[\s_-]/g, '') === 'atrisk';

const isOnTrack = (student) =>
  String(student.status).toLowerCase().replace(/[\s_-]/g, '') === 'ontrack';

export default function StudentsTab({
  students = [],
  onStudentPress,
  isLoading = false,
  error = '',
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const counts = useMemo(
    () => ({
      all: students.length,
      onTrack: students.filter(isOnTrack).length,
      atRisk: students.filter(isAtRisk).length,
    }),
    [students]
  );

  const filteredStudents = useMemo(() => {
    if (activeFilter === 'atRisk') return students.filter(isAtRisk);
    if (activeFilter === 'onTrack') return students.filter(isOnTrack);
    return [...students];
  }, [activeFilter, students]).sort((a, b) => {
    const scoreA = Number.isFinite(a.averageScore) ? a.averageScore : -1;
    const scoreB = Number.isFinite(b.averageScore) ? b.averageScore : -1;
    return scoreB - scoreA
      || (b.completedLessonCount || 0) - (a.completedLessonCount || 0)
      || String(a.name || '').localeCompare(String(b.name || ''));
  });

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={filteredStudents}
      keyExtractor={(student) => String(student.id ?? student.name)}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.filters}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.key;
              const count = counts[filter.key];

              return (
                <Pressable
                  key={filter.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  onPress={() => setActiveFilter(filter.key)}
                  style={[
                    styles.filter,
                    filter.key === 'all' && isActive && styles.allFilter,
                    filter.key === 'onTrack' && styles.onTrackFilter,
                    filter.key === 'atRisk' && styles.atRiskFilter,
                    isActive && filter.key !== 'all' && styles.activeFilter,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter.key === 'all' && isActive && styles.allFilterText,
                      filter.key === 'onTrack' && styles.onTrackText,
                      filter.key === 'atRisk' && styles.atRiskText,
                    ]}
                  >
                    {filter.label} {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={error ? styles.error : styles.emptyText}>
              {error || (students.length === 0
                ? 'No students have completed a lesson for this subject yet.'
                : 'No students in this group yet.')}
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <StudentCard student={item} onPress={() => onStudentPress?.(item)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#EAF1FD',
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filter: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 29,
    paddingHorizontal: 12,
  },
  allFilter: {
    backgroundColor: '#244FDB',
  },
  onTrackFilter: {
    backgroundColor: '#D9F7E5',
  },
  atRiskFilter: {
    backgroundColor: '#FCE1E2',
  },
  filterText: {
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  allFilterText: {
    color: Colors.surface,
  },
  onTrackText: {
    color: '#13713B',
  },
  atRiskText: {
    color: '#A52323',
  },
  empty: {
    alignItems: 'center',
    marginTop: 30,
  },
  emptyText: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    color: Colors.danger,
    fontFamily: Nunito.medium,
    fontSize: 14,
    textAlign: 'center',
  },
});