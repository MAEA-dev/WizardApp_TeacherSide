import {View, Text, StyleSheet} from "react-native";
import { Colors, Opacity } from "../../../../constants/colors";
import ScoreDistributionChart from "./ScoreDistributionChart";
import { Shadows } from "../../../../constants/shadows";
import { Fredoka, Nunito } from "../../../../constants/fonts";

export default function ClassPerformance({classAvg, passed, score}){

    return(
        <View style={styles.container}>
            <Text style={styles.titleTxt}>Class Performance</Text>  
            <View style={styles.cardContainer}>
                <View style={[styles.card, {backgroundColor: Colors.primarySoft}]}>
                    <Text style ={styles.label}>Class average</Text>
                    <Text style={styles.dataTxt}>{classAvg}%</Text>
                </View>
                <View style={[styles.card, {backgroundColor: Colors.accent + Opacity[20]}]}>
                    <Text style ={styles.label}>Passed</Text>
                    <Text style= {styles.dataTxt}>{passed}</Text>
                </View>
                
            </View >
                <ScoreDistributionChart scores={score}/>      
            </View>
    );




}

const styles = StyleSheet.create({
    container:{
        padding: 15,
        borderRadius: 20,
        backgroundColor: "#ffff",
        marginTop: 10,
        ...Shadows.medium
    },
    cardContainer:{
        flexDirection: "row",
        gap: 10,
        justifyContent: "center",
        alignItems:"center",
        marginBottom: 10
    },
    card:{
        flex: 1,
        padding: 10,
        borderRadius: 15
    },
    titleTxt: {
        fontSize: 16,
        fontFamily: Fredoka.semiBold,
        marginBottom: 10
    },
    label: {
        fontFamily: Nunito.medium,
        fontSize: 12
    },
    dataTxt:{
        fontFamily: Fredoka.semiBold,
        fontSize: 25

    }


});