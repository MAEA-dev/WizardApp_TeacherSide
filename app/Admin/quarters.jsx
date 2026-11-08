import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AdminCard, AdminColors, AdminShell, AdminText } from '../../components/admin/AdminShell';
import { Inter } from '../../constants/fonts';
import { getAdminSettings, saveAdminQuarterSettings } from '../../services/adminService';
 
const QUARTERS = [1, 2, 3, 4];
 
const toValidQuarter = (value) => {
  const quarter = Number(value);
  return QUARTERS.includes(quarter) ? quarter : null;
};
 
export default function AdminQuarters() {
  const [savedQuarter, setSavedQuarter] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
 
  useEffect(() => {
    let active = true;
    getAdminSettings()
      .then((settings) => {
        if (!active) return;
        const quarter = toValidQuarter(settings?.activeQuarter);
        setAcademicYear(settings?.academicYear || '2026-2027');
        setSavedQuarter(quarter);
        setSelectedQuarter(quarter);
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
 
  const isBusy = isLoading || isSaving || !!loadError;
  const hasChanges = selectedQuarter !== null && selectedQuarter !== savedQuarter;
  const canSave = hasChanges && !isBusy;
 
  const selectQuarter = (quarter) => {
    setSelectedQuarter(quarter);
    setSaved(false);
    setSaveError('');
  };
 
  const saveChanges = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setSaveError('');
    setSaved(false);
 
    try {
      await saveAdminQuarterSettings({ activeQuarter: selectedQuarter });
      setSavedQuarter(selectedQuarter);
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
      >
        <AdminCard style={styles.currentCard}>
          <AdminText style={styles.currentLabel}>Current active quarter</AdminText>
          {isLoading ? (
            <ActivityIndicator color={AdminColors.primary} style={styles.loader} />
          ) : (
            <AdminText style={styles.currentValue}>
              {savedQuarter ? `Quarter ${savedQuarter}` : 'Not set'}
            </AdminText>
          )}
          <AdminText style={styles.currentHint}>
            Students only see lessons from the active quarter.
          </AdminText>
        </AdminCard>
 
        {!!loadError && (
          <AdminText accessibilityRole="alert" style={styles.error}>
            {loadError}
          </AdminText>
        )}
 
        <View style={styles.grid}>
          {QUARTERS.map((quarter) => {
            const isSelected = selectedQuarter === quarter;
            const isSaved = savedQuarter === quarter;
            return (
              <Pressable
                key={quarter}
                accessibilityRole="radio"
                accessibilityLabel={`Quarter ${quarter}${isSaved ? ', active' : ''}`}
                accessibilityState={{ selected: isSelected, disabled: isBusy }}
                disabled={isBusy}
                onPress={() => selectQuarter(quarter)}
                style={[
                  styles.quarterCard,
                  isSelected && styles.selectedCard,
                  isBusy && styles.disabledButton,
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  {isSaved && (
                    <View style={styles.activeBadge}>
                      <AdminText style={styles.activeBadgeText}>Active</AdminText>
                    </View>
                  )}
                </View>
                <AdminText style={[styles.quarterTitle, isSelected && styles.selectedTitle]}>
                  Quarter {quarter}
                </AdminText>
              </Pressable>
            );
          })}
        </View>
 
        {!!saveError && (
          <AdminText accessibilityRole="alert" style={styles.error}>
            {saveError}
          </AdminText>
        )}
        {saved && <AdminText style={styles.success}>Active quarter saved.</AdminText>}
 
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          disabled={!canSave}
          onPress={saveChanges}
          style={[styles.saveButton, !canSave && styles.disabledButton]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <AdminText style={styles.saveButtonText}>Save changes</AdminText>
          )}
        </Pressable>
 
        <View style={styles.note}>
          <AdminText style={styles.noteText}>
            Changing the active quarter never deletes lessons. It only sets which quarter&apos;s
            lessons students can see.
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
  currentCard: {
    gap: 4,
  },
  currentLabel: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
  },
  currentValue: {
    color: AdminColors.primary,
    fontFamily: Inter.bold,
    fontSize: 24,
  },
  currentHint: {
    color: AdminColors.muted,
    fontFamily: Inter.regular,
    fontSize: 12,
    marginTop: 2,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quarterCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D4CCF6',
    borderRadius: 14,
    borderWidth: 1.5,
    flexBasis: '47%',
    flexGrow: 1,
    gap: 14,
    minHeight: 88,
    padding: 14,
  },
  selectedCard: {
    backgroundColor: '#E9E4FF',
    borderColor: AdminColors.primary,
  },
  cardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radio: {
    alignItems: 'center',
    borderColor: '#AAA6C5',
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioSelected: {
    borderColor: AdminColors.primary,
  },
  radioDot: {
    backgroundColor: AdminColors.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  quarterTitle: {
    fontFamily: Inter.semiBold,
    fontSize: 15,
  },
  selectedTitle: {
    color: AdminColors.primary,
  },
  activeBadge: {
    backgroundColor: '#D1FAE8',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    color: '#08785E',
    fontFamily: Inter.semiBold,
    fontSize: 11,
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