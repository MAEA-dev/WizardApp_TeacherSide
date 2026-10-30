import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Nunito } from "../../../constant/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

export default function AnswerChoicesField({
  choices,
  onChange,
  onAdd,
  onRemove,
  label = "Answer choices",
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {choices.map((choice, index) => (
        <View key={`choice-${index}`} style={styles.row}>
          <TextInput
            accessibilityLabel={`Answer choice ${index + 1}`}
            onChangeText={(text) => onChange(index, text)}
            placeholder={`Choice ${index + 1}`}
            style={styles.input}
            value={choice}
          />
          {choices.length > 2 && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Remove answer choice ${index + 1}`}
              onPress={() => onRemove(index)}
              style={styles.removeButton}
            >
              <MaterialIcons name="close" size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onAdd}
        style={styles.addButton}
      >
        <MaterialIcons name="add" size={16} color={colors.primary} />
        <Text style={styles.addText}>Add choice</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  label: {
    color: colors.text,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  input: {
    flex: 1,
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
  removeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#F5F3FF",
  },
  addButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 5,
  },
  addText: {
    color: colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
});
