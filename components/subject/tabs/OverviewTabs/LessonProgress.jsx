import {View , Text, StyleSheet} from 'react-native';
import ProgressBar from "../../../other/ProgressBar"
import { Shadows } from '../../../../constant/shadows';
import { Nunito } from '../../../../constant/fonts';





export default function LessonProgress({totalLessons , finishedLessons}){
    return(
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={styles.label}>Lessons finished</Text>
                <Text style={[styles.label, {fontFamily: Nunito.extraBold}]}>{finishedLessons} of {totalLessons}</Text>
            </View> 
            <ProgressBar current={finishedLessons} total={totalLessons} height={8}/>
        </View>
    );
}
const styles = StyleSheet.create({
    container:{
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 15,   
        height: 60,
        ...Shadows.small
    },
    labelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        marginBottom: 10
    },
    label:{
        fontFamily: Nunito.medium,
        fontSize: 13
    }

});