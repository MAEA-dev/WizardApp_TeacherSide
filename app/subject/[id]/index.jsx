import { useState } from "react";
import {View, Text, StyleSheet} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "../../../constant/colors";
import Header  from "../../../components/subject/header";
import { Subjects } from "../../../Mocks/subjects";
import SubjectTabs from "../../../components/subject/subjectTabs";
import StudentsTab  from "../../../components/subject/tabs/StudentTabs/StudentsTabs";
import OverviewTab from "../../../components/subject/tabs/OverviewTabs/OverviewTabs";
import LessonsTab from "../../../components/subject/tabs/LessonTabs/LessonsTabs";
import { Lessons } from "../../../Mocks/lesson";
import { Students } from "../../../Mocks/students";
import { User } from "../../../Mocks/user";

const TABS = [
  { key: "lessons", label: "Lessons" },
  { key: "overview", label: "Overview" },
  { key: "students", label: "Students" },
];


export default function SubjectDetails(){

    const {id} = useLocalSearchParams();
    const [activeTab , setActiveTab] = useState("lessons");
    const subject = Subjects.find((s) => String(s.id)=== id);
  
    if(!subject) return <Text>Subject not found</Text>

    return(
        <View style={{flex: 1, backgroundColor: Colors.bg}}>
            
            <View style={styles.header}>
               <Header subjectName={subject.name} grade={subject.grade}/>
               <SubjectTabs tabs={TABS} active={activeTab} onChange={setActiveTab}/>
            </View>
           
             <View style={styles.content}>
                    {activeTab === "lessons" && (<LessonsTab subjectId={subject.id} lessons={Lessons}  teacher={User}/>)}
                    {activeTab ==="overview" && (<OverviewTab  />)}
                                        {activeTab === "students" && (
                                            <StudentsTab
                                                students={Students}
                                                onStudentPress={(student) =>
                                                    router.push({
                                                        pathname: "/subject/[id]/student/[studentId]",
                                                        params: { id: String(id), studentId: String(student.id) },
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
    }
});