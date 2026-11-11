import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Nunito } from "../../../constants/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";
import AnswerChoicesField from "./AnswerChoicesField";

export default function InteractiveStepCard({
  step,
  index,
  number,
  isEditing,
  draftText,
  onChangeText,
  draftChoices,
  onChangeChoice,
  onAddChoice,
  onRemoveChoice,
  draftAnswer,
  onChangeAnswer,
  error,
  onToggleEdit,
  onUploadImage,
  onRemoveImage,
  isUploadingImage,
  canUploadImage,
  canManageImages = true,
}) {
  const isExplanation = step.type === "say";
  const text = isExplanation ? step.text : step.question;

  return (
    <View style={[styles.card, isEditing && styles.editingCard]}>
      <View style={styles.number}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.type}>
          {isExplanation ? "Tutor explanation" : "Multiple choice"}
        </Text>
        {isEditing ? (
          <>
            <TextInput
              accessibilityLabel={`Edit ${isExplanation ? "tutor explanation" : "question"}`}
              multiline
              onChangeText={onChangeText}
              style={styles.textInput}
              value={draftText}
            />
            {!isExplanation && (
              <>
                <AnswerChoicesField
                  choices={draftChoices}
                  onChange={onChangeChoice}
                  onAdd={onAddChoice}
                  onRemove={onRemoveChoice}
                />
                <TextInput
                  accessibilityLabel="Edit correct answer"
                  onChangeText={onChangeAnswer}
                  placeholder="Correct answer (must match a choice)"
                  style={styles.answerInput}
                  value={draftAnswer}
                />
              </>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        ) : (
          <>
            <Text style={styles.body}>{text}</Text>
            {canManageImages && isExplanation && step.imageUrl ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: step.imageUrl }}
                  style={styles.lessonImage}
                  resizeMode="cover"
                  accessibilityLabel="Teacher-uploaded lesson photo"
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Remove lesson photo"
                  disabled={isUploadingImage}
                  onPress={() => onRemoveImage(index, step)}
                  style={styles.imageAction}
                >
                  <MaterialIcons name="delete-outline" size={16} color="#B42318" />
                  <Text style={styles.removeImageText}>Remove photo</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {canManageImages && isExplanation && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={step.imageUrl ? "Replace lesson photo" : "Upload lesson photo"}
                disabled={isUploadingImage || (!step.imageUrl && !canUploadImage)}
                onPress={() => onUploadImage(index, step)}
                style={[
                  styles.imageAction,
                  (isUploadingImage || (!step.imageUrl && !canUploadImage)) &&
                    styles.disabledImageAction,
                ]}
              >
                <MaterialIcons
                  name={isUploadingImage ? "hourglass-empty" : "add-photo-alternate"}
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.uploadImageText}>
                  {isUploadingImage
                    ? "Uploading photo..."
                    : step.imageUrl
                    ? "Replace photo"
                    : "Upload photo"}
                </Text>
              </TouchableOpacity>
            )}
            {!isExplanation && (
              <>
                <View style={styles.choices}>
                  {(step.choices ?? []).map((choice, index) => (
                    <View
                      key={`choice-preview-${index}`}
                      style={[styles.choice, choice === step.answer && styles.correctChoice]}
                    >
                      <Text style={styles.choiceText}>{choice}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.correctAnswer}>Correct answer: {step.answer}</Text>
              </>
            )}
          </>
        )}
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={isEditing ? "Save step" : "Edit step"}
        onPress={onToggleEdit}
        style={[styles.editButton, isEditing && styles.activeEditButton]}
      >
        <MaterialIcons
          name={isEditing ? "check" : "edit"}
          size={17}
          color={isEditing ? "#FFFFFF" : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
  },
  editingCard: {
    borderColor: "#7466FF",
    borderWidth: 1.5,
  },
  number: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    color: "#FFFFFF",
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  content: { flex: 1, gap: 6 },
  type: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  body: {
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  imageContainer: {
    gap: 6,
  },
  lessonImage: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: "#F2F0FA",
  },
  imageAction: {
    alignSelf: "flex-start",
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
  },
  disabledImageAction: {
    opacity: 0.5,
  },
  uploadImageText: {
    color: colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  removeImageText: {
    color: "#B42318",
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  textInput: {
    minHeight: 48,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 11,
    lineHeight: 15,
    textAlignVertical: "top",
  },
  answerInput: {
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 12,
  },
  error: {
    color: "#B91C1C",
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#F8F7FF",
  },
  correctChoice: {
    borderColor: colors.primary,
    backgroundColor: "#E9E6FF",
  },
  choiceText: {
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 10,
  },
  correctAnswer: {
    color: colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 10,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  activeEditButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
