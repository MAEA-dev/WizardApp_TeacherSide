import { StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Nunito } from "../../../constant/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

export default function LessonFinalMessage({ message }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <MaterialIcons name="auto-awesome" size={18} color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#E9E6FF",
  },
  text: {
    flex: 1,
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 12,
    lineHeight: 18,
  },
});
