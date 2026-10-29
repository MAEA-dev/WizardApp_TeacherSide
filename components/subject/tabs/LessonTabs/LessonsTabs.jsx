import { Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Nunito } from "../../../../constant/fonts";
import LessonCard from "../LessonTabs/lessonCard";

export default function LessonsTab({ subjectId, lessons, teacher }) {
  const router = useRouter();

  return (
    <FlatList
      data={lessons}
      keyExtractor={(l) => String(l.id)}
      ListEmptyComponent={<Text style={styles.empty}>No lessons yet.</Text>}
      renderItem={({ item }) => (
          <LessonCard title={item.title} teacher={teacher}/>
      )}  
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", marginTop: 30, fontFamily: Nunito.medium, },
});