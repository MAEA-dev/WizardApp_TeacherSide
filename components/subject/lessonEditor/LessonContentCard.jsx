import { StyleSheet, Text, View } from "react-native";
import { Fredoka, Nunito } from "../../../constants/fonts";
import { LESSON_EDITOR_COLORS as colors } from "./theme";

export default function LessonContentCard({ title, introMessage, language }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Lesson content</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{introMessage}</Text>
      <Text style={styles.helper}>Language: {language}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  label: {
    color: colors.text,
    fontFamily: Nunito.bold,
    fontSize: 12,
    marginBottom: 5,
  },
  title: {
    color: colors.primary,
    fontFamily: Fredoka.semiBold,
    fontSize: 17,
    marginBottom: 5,
  },
  body: {
    color: colors.text,
    fontFamily: Nunito.medium,
    fontSize: 13,
    lineHeight: 20,
  },
  helper: {
    color: "#8480A1",
    fontFamily: Nunito.medium,
    fontSize: 10,
    marginTop: 8,
  },
});
