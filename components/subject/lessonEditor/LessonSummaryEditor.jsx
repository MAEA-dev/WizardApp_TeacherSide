import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Fredoka, Nunito } from "../../../constant/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

export default function LessonSummaryEditor({
  items,
  editingIndex,
  onAdd,
  onChange,
  onToggleEdit,
  onRemove,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Lesson summary</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onAdd}
          style={styles.addButton}
        >
          <MaterialIcons name="add" size={17} color={colors.primary} />
          <Text style={styles.actionText}>Add point</Text>
        </TouchableOpacity>
      </View>

      {items.map((item, index) => (
        <View key={`summary-${index}`} style={styles.row}>
          {editingIndex === index ? (
            <TextInput
              accessibilityLabel={`Edit summary point ${index + 1}`}
              multiline
              onChangeText={(text) => onChange(index, text)}
              style={styles.editor}
              value={item}
            />
          ) : (
            <Text style={styles.item}>{item}</Text>
          )}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={editingIndex === index ? "Finish editing summary" : "Edit summary"}
            onPress={() => onToggleEdit(index)}
            style={styles.iconButton}
          >
            <MaterialIcons
              name={editingIndex === index ? "check" : "edit"}
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Remove summary point"
            onPress={() => onRemove(index)}
            style={styles.iconButton}
          >
            <MaterialIcons name="close" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
      ))}

      {items.length === 0 && (
        <Text style={styles.item}>Add summary points for this lesson.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    marginTop: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  heading: {
    color: colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  actionText: {
    color: colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  item: {
    flex: 1,
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 11,
    lineHeight: 16,
  },
  editor: {
    flex: 1,
    minHeight: 40,
    padding: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 11,
    lineHeight: 16,
    textAlignVertical: "top",
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
  },
});
