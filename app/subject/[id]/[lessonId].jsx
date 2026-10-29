import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function LessonScreen() {
  const { id, lessonId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text>Subject: {id}</Text>
      <Text>Lesson: {lessonId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});