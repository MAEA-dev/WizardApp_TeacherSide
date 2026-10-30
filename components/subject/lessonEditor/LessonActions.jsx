import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Nunito } from "../../../constant/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

export default function LessonActions() {
  return (
    <View style={styles.container}>
      <TouchableOpacity accessibilityRole="button" style={styles.regenerateButton}>
        <Text style={styles.regenerateText}>Regenerate all</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" style={styles.publishButton}>
        <Text style={styles.publishText}>Publish to class</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  regenerateButton: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#7466FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  regenerateText: {
    color: colors.primary,
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
  publishButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  publishText: {
    color: "#FFFFFF",
    fontFamily: Nunito.bold,
    fontSize: 12,
  },
});
