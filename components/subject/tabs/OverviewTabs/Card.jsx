import {View, StyleSheet, Text} from "react-native";
import { Shadows } from "../../../../constants/shadows";
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
        flex: 1,
        padding:10,
        borderRadius: 10,
        backgroundColor: "#ffff",
        
        ...Shadows.small
    },
    nameTxt:{
        fontFamily: Nunito.bold,
        fontSize: 12
    },
    dataTxt:{
        fontFamily: Fredoka.semiBold,
        fontSize: 22,
    }
});