import {useState} from "react";
import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from "../../constants/colors";
import { Fredoka, Nunito } from "../../constants/fonts";
import { TextShadows } from "../../constants/shadows";
import {useRouter} from "expo-router";
import NewLessonModal from "./NewLessonModal";


export default function Header({subjectId, subjectName, grade}){
    const router = useRouter();
    const [isNewLessonOpen, setIsNewLessonOpen] = useState(false);

    return(

        <View style={styles.container}>
            <TouchableOpacity style={styles.circle} onPress={()=> router.push("Screens/home")}>
                <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
            <View style={styles.subjectBox}>
                <Text style={styles.subjectText}>{subjectName}{"  "}{grade}</Text>
                <Text style={styles.subtitle}>Here are your current lessons</Text>
            </View>
            <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setIsNewLessonOpen(true)}
                style={styles.button}
            >
                <Text style={styles.btnText}>New lesson</Text>
            </TouchableOpacity>
            <NewLessonModal
                visible={isNewLessonOpen}
                onClose={() => setIsNewLessonOpen(false)}
                subjectId={subjectId}
                subjectName={subjectName}
                grade={grade}
            />
        </View>

    );

}

const styles= StyleSheet.create({
    container: {
        gap: 10,
        flexDirection: "row",
        alignItems:"center",
        padding: 10,
        flexGrow:1,
    },
    circle:{
        width: 40,
        height: 40,
        borderRadius: 45,
        backgroundColor: Colors.primarySoft,
        justifyContent: "center",
        alignItems: "center"
    },
    subjectBox:{
        flex: 1,
        minWidth: 0,
        marginLeft: 5
    },
    subjectText:{
        fontFamily: Fredoka.semiBold,
        fontSize: 17,
        textTransform: "capitalize",
        
        
    },
    button:{
        flexShrink: 0,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.warning,
        borderRadius: 30,
    },
    btnText:{
        fontFamily: Fredoka.semiBold,
        fontSize: 12,
        color: Colors.bg,
        ...TextShadows.subtle
    },
    subtitle:{  
        fontFamily: Nunito.medium,
        fontSize: 11
    }


});