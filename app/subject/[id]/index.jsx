import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "../../../constants/colors";
import Header  from "../../../components/subject/header";
import SubjectTabs from "../../../components/subject/subjectTabs";
import StudentsTab  from "../../../components/subject/tabs/StudentTabs/StudentsTabs";
import OverviewTab from "../../../components/subject/tabs/OverviewTabs/OverviewTabs";
import LessonsTab from "../../../components/subject/tabs/LessonTabs/LessonsTabs";
import {
    filterCompletionsByQuarter,
    getLessonIdsByQuarter,
    getQuarter,
    getStudentAverageDetails,
} from "../../../components/subject/tabs/OverviewTabs/overviewMetrics";
import useSubjectDetails from "../../../hooks/useSubjectDetails";

const TABS = [
  { key: "lessons", label: "Lessons" },
  { key: "overview", label: "Overview" },
  { key: "students", label: "Students" },
];

export default function SubjectDetails(){
    const {id} = useLocalSearchParams();
    const [activeTab , setActiveTab] = useState("lessons");
    const [selectedQuarter, setSelectedQuarter] = useState("all");
    const subjectId = Array.isArray(id) ? id[0] : id;
    const {
        subject,
        lessons,
        completions,
        gradeStudentCount,
        isLoading,
        isLoadingLessons,
        isLoadingCompletions,
        gradeCountError,
        completionsError,
        error,
        lessonsError,
        students,
    } = useSubjectDetails(subjectId);

    const quarters = useMemo(
        () => [...new Set(lessons.map(getQuarter).filter(Boolean))].sort((a, b) => a - b),
        [lessons]
    );

    useEffect(() => {
        setSelectedQuarter((current) =>
            current === "all" && quarters.includes(1)
                ? 1
                : current !== "all" && !quarters.includes(current)
                    ? "all"
                    : current
        );
    }, [quarters]);

    const lessonIdsByQuarter = useMemo(
        () => getLessonIdsByQuarter(lessons),
        [lessons]
    );
    const quarterCompletions = useMemo(
        () => filterCompletionsByQuarter(completions, lessonIdsByQuarter, selectedQuarter),
        [completions, lessonIdsByQuarter, selectedQuarter]
    );
    const atRiskStudents = useMemo(
        () =>
            getStudentAverageDetails(quarterCompletions)
                .filter(({ averageScore }) => averageScore < 70)
                .sort((a, b) => a.averageScore - b.averageScore || a.name.localeCompare(b.name)),
        [quarterCompletions]
    );

    if (isLoading) {
        return (
            <View style={styles.state}>
                <ActivityIndicator color={Colors.primary} />
                <Text style={styles.stateText}>Loading subject...</Text>
            </View>
        );
    }

    if (error || !subject) {
        return (
            <View style={styles.state}>
                <Text style={styles.stateText}>{error || 'Subject not found.'}</Text>
            </View>
        );
    }

    if (subject.active === false) {
        return (
            <View style={styles.state}>
                <Text style={styles.stateText}>This subject is inactive and unavailable.</Text>
                <Text style={styles.backText} onPress={() => router.back()}>
                    Go back
                </Text>
            </View>
        );
    }

    return(
        <View style={{flex: 1, backgroundColor: Colors.bg}}>
            
            <View style={styles.header}>
               <Header
                    subjectId={subject.id}
                    subjectName={subject.name}
                    grade={subject.grade}
                    atRiskStudents={atRiskStudents}
                />
               <SubjectTabs tabs={TABS} active={activeTab} onChange={setActiveTab}/>
            </View>
           
             <View style={styles.content}>
                {activeTab === "lessons" && (
                    <LessonsTab
                        subjectId={subject.id}
                        lessons={lessons}
                        error={lessonsError}
                        isLoading={isLoadingLessons}
                    />
                )}
                {activeTab === "overview" && (
                    <OverviewTab
                        lessons={lessons}
                        completions={completions}
                        quarterCompletions={quarterCompletions}
                        quarters={quarters}
                        selectedQuarter={selectedQuarter}
                        onQuarterChange={setSelectedQuarter}
                        gradeStudentCount={gradeStudentCount}
                        gradeCountError={gradeCountError}
                        isLoadingCompletions={isLoadingCompletions}
                        completionsError={completionsError}
                    />
                )}
                {activeTab === "students" && (
                    <StudentsTab
                        students={students}
                        isLoading={isLoadingCompletions}
                        error={completionsError}
                        onStudentPress={(student) =>
                            router.push({
                                pathname: "/subject/[id]/student/[studentId]",
                                params: {
                                    id: String(subject.id),
                                    studentId: String(student.id),
                                },
                            })
                        }
                    />
                )}
            </View>
           
        </View>
    );
}


const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Colors.neutralBg
        
    },
    header:{
        flexShrink: 0,
        flexGrow: 0,
        backgroundColor: Colors.neutralBg
    },
    state: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bg,
        padding: 24,
        gap: 12,
    },
    stateText: {
        color: Colors.textMuted,
        textAlign: 'center',
    },
    backText: {
        color: Colors.primary,
        fontWeight: '700',
        padding: 12,
    },
});