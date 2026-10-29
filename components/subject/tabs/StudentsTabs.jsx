import { View, Text, FlatList, StyleSheet } from "react-native";
import { Colors } from "../../../constant/colors";
import { Nunito } from "../../../constant/fonts";

export default function StudentsTab({ students }) {
  return (
    <FlatList
      data={students}
      keyExtractor={(s) => String(s.id)}
      ListEmptyComponent={<Text style={styles.empty}>No students yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg,
    padding: 14,
    borderRadius: 15,
    marginVertical: 5,
  },
  name: { fontFamily: Nunito.bold, fontSize: 15 },
  empty: { textAlign: "center", marginTop: 30, fontFamily: Nunito.medium },
});