import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Fredoka, Nunito } from "../../../constant/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

export default function LessonHeader({ subtitle, onBack }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.copy}>
        <Text style={styles.title}>Lesson editor</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.icon}>
        <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  title: {
    color: colors.text,
    fontFamily: Fredoka.semiBold,
    fontSize: 20,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: Nunito.medium,
    fontSize: 12,
    marginTop: 1,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#E9E6FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
