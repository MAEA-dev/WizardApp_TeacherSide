import { Text , View, StyleSheet} from "react-native";
import Card from "./Card";


const subjectData = [
  { id: "student-count", label: "Students", value: 32 },
  { id: "lesson-count", label: "Lessons", value: 18 },
  { id: "avg-time", label: "Avg. time", value: "12 min" },
];

export default function DetailsHeader(){
    
    return(
        <View style={styles.container}>
            {subjectData.map((s) =>(
                <Card key={s.id} name={s.label} data={s.value}/>
            ))}
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 10,
        marginBottom:10
    }
});