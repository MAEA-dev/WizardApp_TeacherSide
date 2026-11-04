import { View, StyleSheet } from "react-native";
import Card from "./Card";

export default function DetailsHeader({
    gradeStudentCount,
    lessonCount,
    averageTime,
}){
    
    return(
        <View style={styles.container}>
            <Card name="Students" data={gradeStudentCount ?? "—"}/>
            <Card name="Lessons" data={lessonCount}/>
            <Card name="Avg. time" data={averageTime}/>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 8,
    },
});