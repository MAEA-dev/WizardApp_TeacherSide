import {View, StyleSheet, Text} from "react-native";
import { Nunito, Fredoka } from "../../../../constants/fonts";

export default function Card({name, data}){

    return(
        <View style={[styles.card ]}>
            <Text style={styles.nameTxt}>{name}</Text>
            <Text style={styles.dataTxt}>{data}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card:{
        backgroundColor: "#FFFFFF",
        borderColor: "#B7CEFF",
        borderRadius: 18,
        borderWidth: 1,
        flex: 1,
        minHeight: 74,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    nameTxt:{
        fontFamily: Nunito.bold,
        fontSize: 11,
        color: "#425779",
    },
    dataTxt:{
        fontFamily: Fredoka.semiBold,
        fontSize: 23,
        color: "#172A4D",
    }
});