import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../../constant/colors';
import { Fredoka, Nunito } from '../../../../constant/fonts';
import StudentCard from './StudentCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'onTrack', label: 'On track' },
  { key: 'atRisk', label: 'At risk' },
];

const isAtRisk = (student) =>
  String(student.status).toLowerCase().replace(/[\s_-]/g, '') === 'atrisk';

export default function StudentsTab({ students = [], onStudentPress }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const counts = useMemo(
    () => ({
      all: students.length,
      onTrack: students.filter((student) => !isAtRisk(student)).length,
      atRisk: students.filter(isAtRisk).length,
    }),
    [students]
  );

  const filteredStudents = useMemo(() => {
    if (activeFilter === 'atRisk') return students.filter(isAtRisk);
    if (activeFilter === 'onTrack') return students.filter((student) => !isAtRisk(student));
    return students;
  }, [activeFilter, students]);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={filteredStudents}
      keyExtractor={(student) => String(student.id ?? student.name)}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
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
                  filter.key === 'all' && styles.allFilter,
                  filter.key === 'onTrack' && styles.onTrackFilter,
                  filter.key === 'atRisk' && styles.atRiskFilter,
                  isActive && styles.activeFilter,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter.key === 'all' && styles.allFilterText,
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
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          {students.length === 0 ? 'No students yet.' : 'No students in this group yet.'}
        </Text>
      }
      renderItem={({ item }) => (
        <StudentCard student={item} onPress={() => onStudentPress?.(item)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 9,
  },
  filter: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 24,
    paddingHorizontal: 9,
  },
  allFilter: {
    backgroundColor: Colors.primary,
  },
  onTrackFilter: {
    backgroundColor: Colors.successBg,
  },
  atRiskFilter: {
    backgroundColor: Colors.dangerBg,
  },
  activeFilter: {
    borderColor: Colors.text,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  allFilterText: {
    color: Colors.surface,
  },
  onTrackText: {
    color: Colors.success,
  },
  atRiskText: {
    color: Colors.danger,
  },
  empty: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 14,
    marginTop: 30,
    textAlign: 'center',
  },
});