import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Nunito, Fredoka } from "../../../constant/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";
import AnswerChoicesField from "./AnswerChoicesField";

export default function NewStepForm({
  type,
  draft,
  error,
  onChangeDraft,
  onChangeChoice,
  onAddChoice,
  onRemoveChoice,
  onCancel,
  onSubmit,
}) {
  const isExplanation = type === "say";
  const textField = isExplanation ? "text" : "question";

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        {isExplanation ? "New tutor explanation" : "New multiple-choice question"}
      </Text>
      <TextInput
        accessibilityLabel={isExplanation ? "Tutor explanation" : "Question"}
        multiline
        onChangeText={(text) => onChangeDraft(textField, text)}
        placeholder={isExplanation ? "Write the tutor explanation" : "Write the question"}
        style={styles.input}
        value={draft[textField] ?? ""}
      />
      {!isExplanation && (
        <>
          <AnswerChoicesField
            choices={draft.choices ?? []}
            onChange={onChangeChoice}
            onAdd={onAddChoice}
            onRemove={onRemoveChoice}
          />
          <TextInput
            accessibilityLabel="Correct answer"
            onChangeText={(answer) => onChangeDraft("answer", answer)}
            placeholder="Correct answer (must match a choice)"
            style={styles.input}
            value={draft.answer ?? ""}
          />
          <TextInput
            accessibilityLabel="Correct answer feedback"
            onChangeText={(reply) => onChangeDraft("correctReply", reply)}
            placeholder="Correct-answer response (optional)"
            style={styles.input}
            value={draft.correctReply ?? ""}
          />
          <TextInput
            accessibilityLabel="Incorrect answer feedback"
            onChangeText={(reply) => onChangeDraft("wrongReply", reply)}
            placeholder="Incorrect-answer response (optional)"
            style={styles.input}
            value={draft.wrongReply ?? ""}
          />
        </>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" onPress={onCancel} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={onSubmit} style={styles.submit}>
          <Text style={styles.submitText}>Add to lesson</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 9,
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  heading: {
    color: colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 16,
  },
  input: {
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 12,
    textAlignVertical: "top",
  },
  error: {
    color: "#B91C1C",
    fontFamily: Nunito.medium,
    fontSize: 11,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  cancel: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  cancelText: {
    color: colors.muted,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  submit: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: colors.primary,
  },
  submitText: {
    color: "#FFFFFF",
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
});
