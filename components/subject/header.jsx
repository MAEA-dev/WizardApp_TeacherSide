import {useState} from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from "../../constants/colors";
import { Fredoka, Nunito } from "../../constants/fonts";
import { TextShadows } from "../../constants/shadows";
import {useRouter} from "expo-router";
import NewLessonModal from "./NewLessonModal";


export default function Header({subjectId, subjectName, grade, atRiskStudents = []}){
    const router = useRouter();
    const [isNewLessonOpen, setIsNewLessonOpen] = useState(false);
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
    const atRiskCount = atRiskStudents.length;

    return(

        <View style={styles.container}>
            <TouchableOpacity style={styles.circle} onPress={()=> router.push("Screens/home")}>
                <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
            </TouchableOpacity>
            <View style={styles.subjectBox}>
                <Text style={styles.subjectText}>{subjectName}{"  "}{grade}</Text>
                <Text style={styles.subtitle}>Here are your current lessons</Text>
            </View>
            {atRiskCount > 0 && (
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`${atRiskCount} ${atRiskCount === 1 ? 'student has' : 'students have'} a recorded average below 70 percent`}
                    accessibilityHint="Open the at-risk student list"
                    onPress={() => setIsRiskModalOpen(true)}
                    style={styles.riskButton}
                >
                    <MaterialIcons name="warning-amber" size={25} color="#C81E1E" />
                    <View style={styles.riskBadge}>
                        <Text style={styles.riskBadgeText}>{atRiskCount}</Text>
                    </View>
                </TouchableOpacity>
            )}
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
            <Modal
                animationType="fade"
                transparent
                visible={isRiskModalOpen}
                onRequestClose={() => setIsRiskModalOpen(false)}
            >
                <View style={styles.riskModalOverlay}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close at-risk student list"
                        onPress={() => setIsRiskModalOpen(false)}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.riskModal}>
                        <Text style={styles.riskModalTitle}>
                            {atRiskCount} {atRiskCount === 1 ? 'student has' : 'students have'} a recorded average below 70%
                        </Text>
                        <ScrollView
                            contentContainerStyle={styles.riskList}
                            style={styles.riskScroll}
                            showsVerticalScrollIndicator
                        >
                            {atRiskStudents.map((student) => (
                                <View key={student.studentId} style={styles.riskStudentRow}>
                                    <Text numberOfLines={1} style={styles.riskStudentName}>
                                        {student.name}
                                    </Text>
                                    <Text style={styles.riskStudentScore}>
                                        {student.averageScore.toFixed(1)}%
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={() => setIsRiskModalOpen(false)}
                            style={styles.riskCloseButton}
                        >
                            <Text style={styles.riskCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    riskButton: {
        alignItems: "center",
        height: 38,
        justifyContent: "center",
        position: "relative",
        width: 38,
    },
    riskBadge: {
        alignItems: "center",
        backgroundColor: "#C81E1E",
        borderColor: Colors.bg,
        borderRadius: 10,
        borderWidth: 1,
        height: 19,
        justifyContent: "center",
        minWidth: 19,
        paddingHorizontal: 3,
        position: "absolute",
        right: -3,
        top: -3,
    },
    riskBadgeText: {
        color: Colors.surface,
        fontFamily: Nunito.extraBold,
        fontSize: 10,
        lineHeight: 12,
    },
    riskModalOverlay: {
        alignItems: "center",
        backgroundColor: "rgba(11, 31, 75, 0.45)",
        flex: 1,
        justifyContent: "center",
        padding: 22,
    },
    riskModal: {
        backgroundColor: Colors.bg,
        borderColor: "#C81E1E",
        borderRadius: 22,
        borderWidth: 1.5,
        elevation: 12,
        maxHeight: "88%",
        maxWidth: 440,
        padding: 18,
        shadowColor: "#C81E1E",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        width: "100%",
    },
    riskModalTitle: {
        color: Colors.text,
        fontFamily: Fredoka.semiBold,
        fontSize: 19,
        textAlign: "center",
    },
    riskScroll: {
        flexShrink: 1,
        maxHeight: 420,
        minHeight: 40,
    },
    riskList: {
        gap: 9,
        paddingVertical: 16,
    },
    riskStudentRow: {
        alignItems: "center",
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
        borderRadius: 13,
        borderWidth: 1,
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
        minHeight: 48,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    riskStudentName: {
        color: Colors.text,
        flex: 1,
        fontFamily: Nunito.bold,
        fontSize: 13,
    },
    riskStudentScore: {
        color: "#B42318",
        fontFamily: Nunito.extraBold,
        fontSize: 13,
    },
    riskCloseButton: {
        alignItems: "center",
        backgroundColor: "#C81E1E",
        elevation: 6,
        borderRadius: 13,
        justifyContent: "center",
        minHeight: 46,
        shadowColor: "#C81E1E",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 7,
    },
    riskCloseText: {
        color: Colors.surface,
        fontFamily: Nunito.bold,
        fontSize: 14,
    },
    subtitle:{  
        fontFamily: Nunito.medium,
        fontSize: 11
    }


});