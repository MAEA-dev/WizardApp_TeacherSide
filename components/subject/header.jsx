import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from "../../constant/colors";
import { Fredoka, Nunito } from "../../constant/fonts";
import { TextShadows } from "../../constant/shadows";
import {useRouter} from "expo-router";



export default function Header({subjectName , grade}){
    const router = useRouter();




    return(

        <View style={styles.container}>
            <TouchableOpacity style={styles.circle} onPress={()=> router.push("(tabs)/home")}>
                <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
            <View style={styles.subjectBox}>
                <Text style={styles.subjectText}>{subjectName}{"  "}{grade}</Text>
                <Text style={styles.subtitle}>Here are your current lessons</Text>
            </View>
            <TouchableOpacity style={styles.button} >
                <Text style={styles.btnText}>New lesson</Text>
            </TouchableOpacity>
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