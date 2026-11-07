import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import HomeHeader from '../../components/home/HomeHeader';
import SubjectCard from '../../components/home/SubjectCard';
import { subjectColors, Colors } from '../../constants/colors';
import AnimatedView  from "../../components/Animation/AnimatedView"
import useScreenAnimationKey from '../../hooks/useScreenAnimationKey';
import useHomeData from '../../hooks/useHomeData';

export default function Home() {
  const { playKey, hidden } = useScreenAnimationKey();
  const {
    teacherClasses,
    isLoadingClasses,
    classesError,
    teacherProfile,
    profileError,
  } = useHomeData();
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [isGradeMenuVisible, setIsGradeMenuVisible] = useState(false);
  const activeClasses = useMemo(
    () => teacherClasses.filter((subject) => subject.active !== false),
    [teacherClasses]
  );

  const grades = useMemo(
    () => [...new Set(activeClasses.map((subject) => String(subject.grade)))].sort(
      (a, b) => Number(a) - Number(b) || a.localeCompare(b)
    ),
    [activeClasses]
  );
  const filteredClasses = useMemo(
    () => activeClasses.filter(
      (subject) => selectedGrade === 'all' || String(subject.grade) === selectedGrade
    ),
    [activeClasses, selectedGrade]
  );

  return (
    <View style={styles.container}>
      <AnimatedView animation='slideDown' duration={500} delay={200}  playKey={playKey} hidden={hidden}>
        <HomeHeader
          name={teacherProfile.name || 'Teacher'}
          gender={teacherProfile.gender}
          email={teacherProfile.email}
        />
      </AnimatedView>
      {!!profileError && (
        <Text accessibilityRole="alert" style={styles.profileError}>{profileError}</Text>
      )}
      
      <ScrollView >
        <AnimatedView animation='slideUp' delay={500} duration={500} playKey={playKey}  style={{flex: 1} } hidden={hidden}> 
        <View style={styles.subjectGrid}>
          {!isLoadingClasses && activeClasses.length > 0 && (
            <View style={styles.filters}>
              <View style={styles.filterRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by grade: ${selectedGrade === 'all' ? 'All grades' : `Grade ${selectedGrade}`}`}
                  accessibilityState={{ expanded: isGradeMenuVisible }}
                  onPress={() => setIsGradeMenuVisible(true)}
                  style={styles.filterChip}
                >
                  <Text style={styles.filterText}>
                    {selectedGrade === 'all' ? 'All grades' : `Grade ${selectedGrade}`}  ▾
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          {filteredClasses.map((subject) =>(
            <SubjectCard 
              key={subject.id}
              id = {subject.id}
              subjectName={subject.name}
              grade={subject.grade}
              color={subjectColors[subject.name] || Colors.primary}
            />
          ))}
          {isLoadingClasses && (
            <ActivityIndicator color={Colors.primary} style={styles.loading} />
          )}
          {!isLoadingClasses && !!classesError && (
            <Text style={styles.emptyText}>{classesError}</Text>
          )}
          {!isLoadingClasses && !classesError && activeClasses.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {teacherClasses.length === 0
                  ? 'No subjects have been added by the admin yet.'
                  : 'There are no active subjects available.'}
              </Text>
            </View>
          )}
          {!isLoadingClasses && !classesError && activeClasses.length > 0 && filteredClasses.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No subjects match these filters.</Text>
            </View>
          )}
        </View>
        </AnimatedView>
      </ScrollView>
      <Modal
        animationType="fade"
        transparent
        visible={isGradeMenuVisible}
        onRequestClose={() => setIsGradeMenuVisible(false)}
      >
        <View style={styles.gradeMenuOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close grade menu"
            onPress={() => setIsGradeMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.gradeMenu}>
            {[
              { key: 'all', label: 'All grades' },
              ...grades.map((grade) => ({ key: grade, label: `Grade ${grade}` })),
            ].map((option) => {
              const isSelected = selectedGrade === option.key;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setSelectedGrade(option.key);
                    setIsGradeMenuVisible(false);
                  }}
                  style={[styles.gradeOption, isSelected && styles.selectedGradeOption]}
                >
                  <Text style={[styles.gradeOptionText, isSelected && styles.selectedGradeOptionText]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutralBg
  },
  subjectGrid:{
    flexDirection: "column",
  },
  filters: {
    marginBottom: 2,
    marginTop: 10,
  },
  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
  },
  filterChip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  gradeMenuOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
    flex: 1,
  },
  gradeMenu: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 8,
    left: 10,
    padding: 5,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    top: 116,
    width: 180,
  },
  gradeOption: {
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  selectedGradeOption: {
    backgroundColor: Colors.primary,
  },
  gradeOptionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedGradeOptionText: {
    color: Colors.surface,
  },
  profileError: {
    color: Colors.danger,
    paddingHorizontal: 14,
    paddingTop: 6,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
  },
  loading: {
    marginTop: 32,
  },
});