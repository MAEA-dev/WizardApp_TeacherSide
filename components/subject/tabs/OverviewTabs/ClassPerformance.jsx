import {View, Text, StyleSheet, Pressable} from "react-native";
import { Colors, Opacity } from "../../../../constants/colors";
import ScoreDistributionChart from "./ScoreDistributionChart";
import { Shadows } from "../../../../constants/shadows";
import { Fredoka, Nunito } from "../../../../constants/fonts";

export default function ClassPerformance({
    classAvg,
    passed,
    scores,
    quarterLabel,
    onQuarterPress,
}){

    return(
        <View style={styles.container}>
            <View style={styles.heading}>
                <Text style={styles.titleTxt}>Class performance</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Filter performance: ${quarterLabel}`}
                    onPress={onQuarterPress}
                    style={styles.quarterButton}
                >
                    <Text style={styles.quarterText}>{quarterLabel}  ▾</Text>
                </Pressable>
            </View>
            <View style={styles.cardContainer}>
                <View style={[styles.card, {backgroundColor: Colors.primarySoft}]}>
                    <Text style ={styles.label}>Class average</Text>
                    <Text style={styles.dataTxt}>{classAvg == null ? "—" : `${classAvg}%`}</Text>
                </View>
                <View style={[styles.card, {backgroundColor: Colors.accent + Opacity[20]}]}>
                    <Text style ={styles.label}>Passed</Text>
                    <Text style= {styles.dataTxt}>{passed}</Text>
                </View>
                
            </View >
                <ScoreDistributionChart scores={scores}/>      
            </View>
    );




}

const styles = StyleSheet.create({
    container:{
        padding: 13,
        borderRadius: 20,
        backgroundColor: "#ffff",
        borderColor: "#B7CEFF",
        borderWidth: 1,
        ...Shadows.medium
    },
    heading: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    cardContainer:{
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems:"center",
        marginBottom: 8
    },
    card:{
        flex: 1,
        padding: 10,
        borderRadius: 15
    },
    titleTxt: {
        color: Colors.text,
        fontSize: 15,
        fontFamily: Fredoka.semiBold,
    },
    label: {
        fontFamily: Nunito.medium,
        fontSize: 12
    },
    dataTxt:{
        fontFamily: Fredoka.semiBold,
        fontSize: 25,
        color: "#172A4D",

    },
    quarterButton: {
        backgroundColor: "#E2ECFF",
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    quarterText: {
        color: Colors.primary,
        fontFamily: Nunito.bold,
        fontSize: 11,
    },


});