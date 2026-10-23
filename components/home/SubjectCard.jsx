import {View, Text, StyleSheet, 
        Image
} from "react-native";
import {Colors , Opacity} from "../../constant/colors"
import { Nunito } from "../../constant/fonts";
import ProgressBar  from "../other/ProgressBar"
export default function SubjectCard({subjectName , grade, color}){
    

    return(

        <View style={[styles.card, {backgroundColor: Colors.bg, borderColor: color + Opacity[20], borderWidth:1 }]}>

            <View style={styles.container}>
                <View style={[styles.ImageContainer, {backgroundColor: color + Opacity[40]} ]}>
                     <Image source={require("../../assets/subjectIcon.png")} style={{width: "90%", height: "90%"}}/>
                </View>
                <View style={{marginLeft: 10,maxWidth: 250}}>
                        <Text style={styles.subjectText} numberOfLines={1} ellipsizeMode="tail">{subjectName}</Text>
                        <Text style={[styles.gradeText, {color: color + Opacity[70]}]}>Grade {grade}</Text>
               </View>
            </View>

            <View style={[styles.container, {justifyContent:"center", gap:10,}]}>
                    <View style={[styles.details, {backgroundColor: color + Opacity[10]}]}>
                        <Text  style={styles.legend}>Students</Text>
                        <Text style={styles.numberText}>32</Text>
                    </View>
                    <View style={[styles.details,{backgroundColor: color + Opacity[10]}]}>
                        <Text style={styles.legend}>Lessons</Text>
                        <Text style={styles.numberText}>14</Text>
                    </View>
            </View>
            <View style={styles.footer}>
                <View style={[styles.container, {justifyContent: 'space-between', paddingLeft:0}]}>
                    <Text style={[styles.legend, {color: Colors.neutral}]}>Lessons Finished</Text>
                    <Text style={[styles.legend, {color: Colors.neutral}]}> 14 of 17</Text>
                </View>
               
                    <ProgressBar current={14} total={17} color={color} />
            </View>
        
        </View>
    )


}

const styles = StyleSheet.create({
    card:{
      minHeight: 200,
      borderRadius: 25,
      padding: 10,
      marginHorizontal: 5,
      marginVertical: 10,
      elevation: 5,
      overflow:"hidden"
    },
    container:{
        flexDirection: "row",
        paddingVertical: 5,
        paddingHorizontal:5
    },
    ImageContainer: {
      justifyContent: "center",
      alignItems: "center" ,
      width: 60,
      height: 60,
      borderRadius: 15,
      overflow:"hidden"
    },
    subjectText: {
        fontSize: 20,
        fontFamily: Nunito.extraBold
    },
    gradeText:{
        fontSize: 15,
        fontFamily: Nunito.medium
    },
    details:{
        width: "50%",
        height: 60,
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        overflow: "hidden"
    },
    legend: {
        fontFamily:Nunito.bold,
        fontSize: 13,
        color: Colors.text
    },
    numberText: {
        marginLeft:5,
        fontFamily: Nunito.extraBold ,
        fontSize: 20
    },
    footer:{
        paddingHorizontal: 5
        
    }
});