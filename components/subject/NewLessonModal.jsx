import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "../../constants/colors";
import { Fredoka, Nunito } from "../../constants/fonts";
import useNewLessonForm from "../../hooks/useNewLessonForm";

const LANGUAGES = ["English", "Filipino", "Taglish"];
const QUARTERS = [1, 2, 3, 4];

export default function NewLessonModal({
  visible,
  onClose,
  subjectId,
  subjectName,
  grade,
}) {
  const {
    selectedFile,
    title,
    setTitle,
    language,
    setLanguage,
    quarter,
    setQuarter,
    isPickingFile,
    isGenerating,
    generationError,
    pickFile,
    closeModal,
    handleGeneratePress,
    canGenerate,
    quarterLabel,
  } = useNewLessonForm({ onClose, subjectId });

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => {
        if (!isGenerating) closeModal();
      }}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>New lesson</Text>
              <Text style={styles.subtitle}>
                Import a file and add lesson details
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close new lesson"
              disabled={isGenerating}
              onPress={closeModal}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={22} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              accessibilityRole="button"
              disabled={isPickingFile || isGenerating}
              onPress={pickFile}
              style={styles.filePicker}
            >
              {isPickingFile ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <MaterialIcons
                  name={selectedFile ? "description" : "upload-file"}
                  size={28}
                  color={Colors.primary}
                />
              )}
              <Text style={styles.filePickerTitle}>
                {selectedFile ? "Choose a different file" : "Choose lesson file"}
              </Text>
              <Text style={styles.filePickerHint}>PDF, DOCX, or TXT</Text>
              {selectedFile?.name ? (
                <Text numberOfLines={1} style={styles.fileName}>
                  {selectedFile.name}
                </Text>
              ) : null}
            </Pressable>

            <View style={styles.contextRow}>
              <Text style={styles.contextText}>{subjectName}</Text>
              <Text style={styles.contextText}>{grade}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Lesson title *</Text>
              <TextInput
                onChangeText={setTitle}
                placeholder="Enter a lesson title"
                placeholderTextColor={Colors.textMuted}
                style={styles.input}
                value={title}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Quarter *</Text>
              <View style={styles.languageOptions}>
                {QUARTERS.map((option) => {
                  const isSelected = quarter === option;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      disabled={isGenerating}
                      key={option}
                      onPress={() => setQuarter(option)}
                      style={[
                        styles.languageOption,
                        isSelected && styles.languageOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageText,
                          isSelected && styles.languageTextSelected,
                        ]}
                      >
                        {quarterLabel(option)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Lesson language</Text>
              <View style={styles.languageOptions}>
                {LANGUAGES.map((option) => {
                  const isSelected = language === option;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={option}
                      onPress={() => setLanguage(option)}
                      style={[
                        styles.languageOption,
                        isSelected && styles.languageOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.languageText,
                          isSelected && styles.languageTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {!!generationError && (
              <Text accessibilityRole="alert" style={styles.error}>
                {generationError}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canGenerate, busy: isGenerating }}
              disabled={!canGenerate}
              onPress={handleGeneratePress}
              style={[
                styles.generateButton,
                !canGenerate && styles.generateButtonDisabled,
              ]}
            >
              {isGenerating ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.generateButtonText}>Generate lesson</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(11, 31, 75, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  heading: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 21,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  form: {
    gap: 16,
    padding: 20,
    paddingBottom: 28,
  },
  filePicker: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  filePickerTitle: {
    color: Colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 14,
    marginTop: 7,
  },
  filePickerHint: {
    color: Colors.textMuted,
    fontFamily: Nunito.medium,
    fontSize: 11,
    marginTop: 2,
  },
  fileName: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 12,
    marginTop: 8,
    maxWidth: "100%",
  },
  contextRow: {
    flexDirection: "row",
    gap: 8,
  },
  contextText: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    color: Colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  field: {
    gap: 7,
  },
  label: {
    color: Colors.text,
    fontFamily: Nunito.bold,
    fontSize: 13,
  },
  input: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: Colors.text,
    fontFamily: Nunito.medium,
    fontSize: 14,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  languageOptions: {
    flexDirection: "row",
    gap: 8,
  },
  languageOption: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  languageOptionSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  languageText: {
    color: Colors.textMuted,
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  languageTextSelected: {
    color: Colors.primary,
  },
  generateButton: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  generateButtonDisabled: {
    opacity: 0.45,
  },
  generateButtonText: {
    color: Colors.surface,
    fontFamily: Nunito.bold,
    fontSize: 14,
  },
});
