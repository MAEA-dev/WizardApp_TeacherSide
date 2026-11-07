import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { AdminCard, AdminColors, AdminShell, AdminText } from '../../components/admin/AdminShell';
import { Inter } from '../../constants/fonts';
import { subscribeToSubjects } from '../../services/teacherClasses';
import { createAdminSubject, setAdminSubjectActive } from '../../services/adminService';

const GRADES = ['4', '5', '6'];
const SUBJECT_COLORS = ['#4538D2', '#C65308', '#00845F'];
export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('4');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingSubjectId, setSavingSubjectId] = useState('');

  useEffect(() => {
    return subscribeToSubjects(
      (items) => {
        setSubjects(items);
        setIsLoading(false);
        setListError('');
      },
      (subscriptionError) => {
        console.error('Unable to load admin subjects:', subscriptionError);
        setListError(subscriptionError.message || 'Unable to load subjects.');
        setIsLoading(false);
      }
    );
  }, []);

  const filteredSubjects = useMemo(
    () => subjects.filter(
      (subject) => selectedGrade === 'All' || String(subject.grade) === selectedGrade
    ),
    [selectedGrade, subjects]
  );

  const toggleSubject = async (subjectId, isActive) => {
    if (savingSubjectId) return;
    setSavingSubjectId(subjectId);
    setListError('');
    try {
      await setAdminSubjectActive(subjectId, isActive);
      setSubjects((previous) =>
        previous.map((subject) =>
          subject.id === subjectId ? { ...subject, active: isActive } : subject
        )
      );
    } catch (toggleError) {
      console.error('Unable to update subject status:', toggleError);
      setListError(toggleError.message || 'Unable to update subject status.');
    } finally {
      setSavingSubjectId('');
    }
  };

  const addSubject = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter a subject name to continue.');
      setSaved(false);
      return;
    }

    setIsSaving(true);
    setError('');
    setSaved(false);
    try {
      await createAdminSubject({
        name: trimmedName,
        grade,
        description: description.trim(),
        color,
        active,
      });
      setName('');
      setDescription('');
      setSaved(true);
    } catch (createError) {
      console.error('Unable to create subject:', createError);
      setError(createError.message || 'Unable to create subject. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell activeTab="subjects" title="Subjects">
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.filters}>
          {['All', ...GRADES].map((filter) => {
            const selected = selectedGrade === filter;
            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedGrade(filter)}
                style={[styles.filterChip, selected && styles.selectedFilter]}
              >
                <AdminText style={[styles.filterText, selected && styles.selectedFilterText]}>
                  {filter === 'All' ? 'All' : `Grade ${filter}`}
                </AdminText>
              </Pressable>
            );
          })}
        </View>

        <AdminCard style={styles.subjectList}>
          {isLoading && <ActivityIndicator color={AdminColors.primary} />}
          {!!listError && <AdminText accessibilityRole="alert" style={styles.error}>{listError}</AdminText>}
          {filteredSubjects.map((subject) => (
            <View key={subject.id} style={styles.subjectRow}>
              <View
                style={[
                  styles.subjectSwatch,
                  { backgroundColor: subject.color || AdminColors.primary },
                ]}
              />
              <View style={styles.subjectDetails}>
                <AdminText style={styles.subjectName}>{subject.name}</AdminText>
                <AdminText style={styles.subjectGrade}>Grade {subject.grade}</AdminText>
              </View>
              <Switch
                accessibilityLabel={`${subject.name} active`}
                disabled={Boolean(savingSubjectId)}
                trackColor={{ false: '#AAA6C5', true: AdminColors.primary }}
                thumbColor="#FFFFFF"
                value={subject.active !== false}
                onValueChange={(value) => toggleSubject(subject.id, value)}
              />
            </View>
          ))}
          {!isLoading && !listError && filteredSubjects.length === 0 && (
            <AdminText style={styles.emptyText}>No subjects for this grade yet.</AdminText>
          )}
        </AdminCard>

        <AdminCard style={styles.formCard}>
          <AdminText style={styles.formTitle}>Add subject</AdminText>
          <View style={styles.fieldGroup}>
            <AdminText style={styles.fieldLabel}>Subject name</AdminText>
            <TextInput
              accessibilityLabel="Subject name"
              editable={!isSaving}
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError('');
                setSaved(false);
              }}
              placeholder="e.g. Araling Panlipunan"
              placeholderTextColor={AdminColors.muted}
              style={styles.input}
            />
          </View>

          <View style={styles.gradeOptions}>
            {GRADES.map((item) => {
              const selected = grade === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  disabled={isSaving}
                  accessibilityState={{ selected }}
                  onPress={() => setGrade(item)}
                  style={[styles.gradeChip, selected && styles.selectedGradeChip]}
                >
                  <AdminText style={[styles.gradeText, selected && styles.selectedGradeText]}>
                    Grade {item}
                  </AdminText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.fieldGroup}>
            <AdminText style={styles.fieldLabel}>Description (optional)</AdminText>
            <TextInput
              accessibilityLabel="Description (optional)"
              editable={!isSaving}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.descriptionInput]}
            />
          </View>

          <View style={styles.colorRow}>
            <AdminText style={styles.fieldLabel}>Color</AdminText>
            <View style={styles.colorOptions}>
              {SUBJECT_COLORS.map((item) => {
                const selected = color === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${item} subject color`}
                    accessibilityState={{ selected }}
                    onPress={() => setColor(item)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: item },
                      selected && styles.selectedColorOption,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.activeRow}>
            <AdminText style={styles.rowLabel}>Active</AdminText>
            <Switch
              accessibilityLabel="New subject active"
              disabled={isSaving}
              trackColor={{ false: '#AAA6C5', true: AdminColors.primary }}
              thumbColor="#FFFFFF"
              value={active}
              onValueChange={setActive}
            />
          </View>

          {!!error && <AdminText accessibilityRole="alert" style={styles.error}>{error}</AdminText>}
          {saved && <AdminText style={styles.success}>Subject added.</AdminText>}
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={addSubject}
            style={[styles.saveButton, isSaving && styles.disabledButton]}
          >
            <AdminText style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save subject'}
            </AdminText>
          </Pressable>
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
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D4CCF6',
    borderRadius: 24,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  selectedFilter: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  filterText: {
    fontFamily: Inter.semiBold,
    fontSize: 12,
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  subjectList: {
    gap: 16,
    paddingVertical: 14,
  },
  subjectRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  subjectSwatch: {
    borderRadius: 11,
    height: 36,
    width: 36,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectName: {
    fontFamily: Inter.semiBold,
    fontSize: 13,
  },
  subjectGrade: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
  },
  emptyText: {
    color: AdminColors.muted,
    fontSize: 13,
    paddingVertical: 8,
  },
  formCard: {
    gap: 14,
  },
  formTitle: {
    fontFamily: Inter.semiBold,
    fontSize: 15,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
  },
  input: {
    borderColor: '#D4CCF6',
    borderRadius: 10,
    borderWidth: 1,
    color: AdminColors.text,
    fontFamily: Inter.regular,
    fontSize: 13,
    height: 44,
    paddingHorizontal: 10,
  },
  gradeOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -4,
  },
  gradeChip: {
    alignItems: 'center',
    borderColor: '#D4CCF6',
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    height: 45,
    justifyContent: 'center',
  },
  selectedGradeChip: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  gradeText: {
    fontFamily: Inter.semiBold,
    fontSize: 12,
  },
  selectedGradeText: {
    color: '#FFFFFF',
  },
  descriptionInput: {
    height: 44,
  },
  colorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorOptions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  colorOption: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  selectedColorOption: {
    borderColor: AdminColors.text,
    borderWidth: 3,
  },
  activeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -3,
  },
  rowLabel: {
    fontFamily: Inter.semiBold,
    fontSize: 13,
  },
  error: {
    color: '#B42318',
    fontSize: 12,
  },
  success: {
    color: '#08785E',
    fontSize: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: AdminColors.primary,
    borderRadius: 12,
    height: 49,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: Inter.bold,
    fontSize: 14,
  },
});
