import { useEffect, useState } from 'react';
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
import { getAdminSettings, saveAdminQuarterSettings } from '../../services/adminService';

const QUARTERS = [1, 2, 3, 4];

export default function AdminQuarters() {
  const [selectedQuarter, setSelectedQuarter] = useState(2);
  const [activeQuarter, setActiveQuarter] = useState(2);
  const [openQuarters, setOpenQuarters] = useState({ 2: true });
  const [dates, setDates] = useState({});
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminSettings()
      .then((settings) => {
        if (!active) return;
        const quarters = settings.quarters || {};
        setIsConfigured(Boolean(settings.configured));
        setAcademicYear(settings.academicYear || '2026-2027');
        setActiveQuarter(Number(settings.activeQuarter) || 2);
        setOpenQuarters(
          Object.fromEntries(
            QUARTERS.map((quarter) => [
              quarter,
              Boolean(quarters[quarter]?.isOpen),
            ])
          )
        );
        setDates(
          Object.fromEntries(
            QUARTERS.map((quarter) => [
              quarter,
              {
                start: quarters[quarter]?.startDate || '',
                end: quarters[quarter]?.endDate || '',
              },
            ])
          )
        );
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Unable to load quarter settings:', error);
        if (active) {
          setLoadError(error.message || 'Unable to load quarter settings.');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const updateDate = (quarter, field, value) => {
    setDates((previous) => ({
      ...previous,
      [quarter]: { ...previous[quarter], [field]: value },
    }));
    setSaved(false);
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaved(false);
    const quarters = Object.fromEntries(
      QUARTERS.map((quarter) => [
        quarter,
        {
          startDate: dates[quarter]?.start || '',
          endDate: dates[quarter]?.end || '',
          isOpen: Boolean(openQuarters[quarter]),
        },
      ])
    );

    try {
      await saveAdminQuarterSettings({ activeQuarter, quarters });
      setIsConfigured(true);
      setSaved(true);
    } catch (error) {
      console.error('Unable to save quarter settings:', error);
      setSaveError(error.message || 'Unable to save quarter settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell activeTab="quarters" title={`Quarters · ${academicYear.replace('-', '–')}`}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading && <ActivityIndicator color={AdminColors.primary} />}
        {!!loadError && <AdminText accessibilityRole="alert" style={styles.error}>{loadError}</AdminText>}
        {!isLoading && !loadError && !isConfigured && (
          <AdminText style={styles.unconfiguredNote}>
            Save these settings to start applying quarter visibility to students.
          </AdminText>
        )}
        <View style={styles.quarterSelector}>
          {QUARTERS.map((quarter) => {
            const selected = selectedQuarter === quarter;
            return (
              <Pressable
                key={quarter}
                accessibilityRole="button"
                disabled={isLoading || isSaving || !!loadError}
                accessibilityState={{ selected }}
                onPress={() => {
                  setSelectedQuarter(quarter);
                  setSaved(false);
                }}
                style={[
                  styles.quarterChip,
                  selected && styles.selectedQuarterChip,
                  (isLoading || isSaving || !!loadError) && styles.disabledButton,
                ]}
              >
                <AdminText style={[styles.quarterChipText, selected && styles.selectedQuarterText]}>
                  Q{quarter}
                </AdminText>
              </Pressable>
            );
          })}
        </View>

        <AdminCard style={styles.editorCard}>
          <View style={styles.cardHeading}>
            <AdminText style={styles.cardTitle}>Quarter {selectedQuarter}</AdminText>
            {activeQuarter === selectedQuarter && (
              <View style={styles.openBadge}>
                <AdminText style={styles.openBadgeText}>
                  Active · {openQuarters[selectedQuarter] ? 'Open' : 'Closed'}
                </AdminText>
              </View>
            )}
          </View>

          <View style={styles.dateFields}>
            {[
              { key: 'start', label: 'Start date' },
              { key: 'end', label: 'End date' },
            ].map((field) => (
              <View key={field.key} style={styles.dateField}>
                <AdminText style={styles.fieldLabel}>{field.label}</AdminText>
                <TextInput
                  accessibilityLabel={`${field.label} for Quarter ${selectedQuarter}`}
                  editable={!isLoading && !isSaving && !loadError}
                  value={dates[selectedQuarter]?.[field.key] || ''}
                  onChangeText={(value) => updateDate(selectedQuarter, field.key, value)}
                  placeholder="mm/dd/yyyy"
                  placeholderTextColor={AdminColors.muted}
                  style={styles.dateInput}
                />
              </View>
            ))}
          </View>

          <View style={styles.openRow}>
            <AdminText style={styles.rowLabel}>Quarter open to students</AdminText>
            <Switch
              accessibilityLabel="Quarter open to students"
              disabled={isLoading || isSaving || !!loadError}
              trackColor={{ false: '#AAA6C5', true: AdminColors.primary }}
              thumbColor="#FFFFFF"
              value={Boolean(openQuarters[selectedQuarter])}
              onValueChange={(isOpen) => {
                setOpenQuarters((previous) => ({
                  ...previous,
                  [selectedQuarter]: isOpen,
                }));
                setSaved(false);
              }}
            />
          </View>

          {!!saveError && <AdminText accessibilityRole="alert" style={styles.error}>{saveError}</AdminText>}
          {saved && <AdminText style={styles.success}>Quarter settings saved.</AdminText>}
          <Pressable
            accessibilityRole="button"
            disabled={isLoading || isSaving || !!loadError}
            onPress={saveChanges}
            style={[styles.saveButton, (isLoading || isSaving || !!loadError) && styles.disabledButton]}
          >
            <AdminText style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : saved ? 'Changes saved' : 'Save changes'}
            </AdminText>
          </Pressable>
        </AdminCard>

        <AdminCard style={styles.allCard}>
          <AdminText style={styles.cardTitle}>All quarters</AdminText>
          {QUARTERS.map((quarter) => {
            const isActive = activeQuarter === quarter;
            return (
              <View key={quarter} style={styles.quarterRow}>
                <View style={styles.quarterDetails}>
                  <AdminText style={styles.rowTitle}>Quarter {quarter}</AdminText>
                  <AdminText style={styles.rowDescription}>
                    {isActive
                      ? openQuarters[quarter]
                        ? 'Lessons visible to students'
                        : 'Quarter closed to students'
                      : quarter < activeQuarter
                        ? 'Closed · lessons kept'
                        : 'Not active'}
                  </AdminText>
                </View>
                {isActive ? (
                  <View style={styles.openBadge}>
                    <AdminText style={styles.openBadgeText}>Active</AdminText>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setActiveQuarter(quarter);
                      setSelectedQuarter(quarter);
                      setSaved(false);
                    }}
                    style={[
                      styles.setActiveButton,
                      (isLoading || isSaving || !!loadError) && styles.disabledButton,
                    ]}
                  >
                    <AdminText style={styles.setActiveText}>Set active</AdminText>
                  </Pressable>
                )}
              </View>
            );
          })}
        </AdminCard>

        <View style={styles.note}>
          <AdminText style={styles.noteText}>
            Changing the active quarter never deletes lessons. It only sets which quarter&apos;s lessons students can see.
          </AdminText>
        </View>
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
  quarterSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  quarterChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D4CCF6',
    borderRadius: 24,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 47,
  },
  selectedQuarterChip: {
    backgroundColor: AdminColors.primary,
    borderColor: AdminColors.primary,
  },
  quarterChipText: {
    fontFamily: Inter.semiBold,
    fontSize: 13,
  },
  selectedQuarterText: {
    color: '#FFFFFF',
  },
  editorCard: {
    gap: 16,
  },
  cardHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: Inter.semiBold,
    fontSize: 15,
  },
  openBadge: {
    backgroundColor: '#D1FAE8',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  openBadgeText: {
    color: '#08785E',
    fontFamily: Inter.semiBold,
    fontSize: 11,
  },
  dateFields: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
    gap: 5,
  },
  fieldLabel: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
  },
  dateInput: {
    borderColor: '#D4CCF6',
    borderRadius: 10,
    borderWidth: 1,
    color: AdminColors.text,
    fontFamily: Inter.regular,
    fontSize: 14,
    height: 44,
    paddingHorizontal: 10,
  },
  openRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  rowLabel: {
    fontFamily: Inter.semiBold,
    fontSize: 13,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: AdminColors.primary,
    borderRadius: 12,
    height: 49,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: Inter.bold,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  error: {
    color: '#B42318',
    fontSize: 12,
  },
  success: {
    color: '#08785E',
    fontSize: 12,
  },
  unconfiguredNote: {
    color: AdminColors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  allCard: {
    gap: 13,
  },
  quarterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  quarterDetails: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: Inter.semiBold,
    fontSize: 13,
  },
  rowDescription: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
    marginTop: 1,
  },
  setActiveButton: {
    alignItems: 'center',
    borderColor: '#D4CCF6',
    borderRadius: 11,
    borderWidth: 1,
    height: 43,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  setActiveText: {
    color: AdminColors.primary,
    fontFamily: Inter.medium,
    fontSize: 12,
  },
  note: {
    backgroundColor: '#E9E4FF',
    borderRadius: 13,
    padding: 12,
  },
  noteText: {
    color: '#514C7A',
    fontFamily: Inter.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
