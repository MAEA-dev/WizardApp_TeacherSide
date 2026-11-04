import {View , Text, StyleSheet} from 'react-native';
import ProgressBar from "../../../other/ProgressBar"
import { Shadows } from '../../../../constants/shadows';
import { Nunito } from '../../../../constants/fonts';




export default function LessonProgress({totalLessons , finishedLessons}){
    const finishedCount = finishedLessons == null ? 0 : finishedLessons;
    return(
        <View style={styles.container}>
            <View style={styles.labelContainer}>
                <Text style={[styles.label, {fontFamily: Nunito.bold, color:"#3d3d3de7"}]}>Lessons finished</Text>
                <Text style={[styles.label, {fontFamily: Nunito.extraBold}]}>
                    {finishedLessons == null ? "—" : `${finishedCount} of ${totalLessons}`}
                </Text>
            </View> 
            <ProgressBar current={finishedCount} total={totalLessons} height={8}/>
        </View>
    );
}
const styles = StyleSheet.create({
    container:{
        backgroundColor: "#fff",
        borderColor: "#B7CEFF",
        borderWidth: 1,
        padding: 13,
        borderRadius: 17,
        ...Shadows.small
    },
    labelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        marginBottom: 8
    },
    label:{
        fontSize: 12
    }

});