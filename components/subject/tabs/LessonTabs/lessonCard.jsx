import {View, Text , StyleSheet, Image} from "react-native";
import { Colors, Opacity } from "../../../../constant/colors";
import { Fredoka, Nunito } from "../../../../constant/fonts";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const ordinal = (n) => `${n}${["st", "nd", "rd", "th"][Math.min(n, 4) - 1] ?? "th"}`;

export const formatDate = (date) => {
  if (!date) return "";
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};



export default function LessonCard({title, teacher, status ="published", quarter=1}){
    const isVerified = status === "published";
    const prefix = teacher?.gender === "Female" ? "Ms" : "Mr";
    const lastName = teacher?.lastName
    const date = Date.now()
    return(
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                    <View style={styles.Icon}>
                        <Image source={require("../../../../assets/lessonIcon3.png")} style={{width: 50, height:50}}/>
                    </View>
                    {isVerified ? (
                                    <View style={[styles.tag, {gap:4}]}>
                                         <MaterialIcons name="check" size={12} color="#166534" />
                                         <Text style={[styles.tagText, { color: "#166534" }]}>Published</Text>
                                    </View>
                                ) : (
                                    <View style={[styles.tag ,{gap:4}]}>
                                            <View style={styles.dot} />
                                            <Text style={[styles.tagText, { color: "#3B4B6B" }]}>For Review</Text>
                                    </View>
                                )}

            </View>
            
            <View style={styles.description}>
                <Text style={styles.titleTxt} numberOfLines={1} >{title}</Text>
                <Text style={[styles.subtitle,{fontSize:12, marginTop: 5, color: '#36559C'}]} >Uploaded by {prefix}. {lastName} </Text>
                <View style={styles.tagRow}>
                    <View style={[styles.tag,]}>
                        <View style={[styles.tag, styles.quarterTag,{gap: 3,  paddingHorizontal: 5,}]}>
                            <Text style={[styles.tagText, {color: "#36559C"}]}>
                                     {ordinal(quarter)} Quarter
                            </Text>
                        </View>  
                        <Text style={[styles.subtitle,{fontSize: 11, color: Colors.neutral, marginLeft: 5}]}>{formatDate(date)}</Text>
                    </View>
                    
                </View>
            </View>
            
            <View style={styles.arrow}>
                <MaterialIcons name="keyboard-arrow-right" size={30} color="black" />
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    card:{
        backgroundColor: "#ffff",

        flexDirection:"row",
        gap: 10,
        margin: 10,
        padding: 10,
        
        justifyContent:"center",
        alignItems: "center",
        
        borderWidth: 1,
        borderColor: Colors.primary + Opacity[40],
        borderRadius: 20

    },
    iconContainer:{
        flexShrink:0,
        marginLeft: 5,
        marginTop: 5,
        width: 65,
        justifyContent: "center",
        alignItems:"center"
    },
    Icon:{
        backgroundColor: Colors.primary + Opacity[60],
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems:"center",
        borderRadius: 15,
      
        
    },
    description:{   
        flex: 1,
        paddingTop: 5
    },
    titleTxt:{
        color:Colors.text,
        fontFamily:Fredoka.medium,
        fontSize: 18
    },
    subtitle: {
        fontFamily: Nunito.medium,
        marginLeft: 5
    },
    tagRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems:"center",
        marginLeft: 3,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent:"center",
       
        paddingVertical: 3,
        borderRadius: 10,
    },
    tagText: {
        fontFamily: Nunito.bold,
        fontSize: 11,
    },
    quarterTag: { backgroundColor: "#E3EDFD" },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#36559C",
    },
    arrow:{
        flexShrink: 0
    }

});