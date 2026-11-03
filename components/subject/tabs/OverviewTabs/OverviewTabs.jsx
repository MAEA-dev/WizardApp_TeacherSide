import { View, Text, StyleSheet , ScrollView } from "react-native";
import LessonProgress from "./LessonProgress";
import DetailsHeader from "./DetailsHeader";
import ClassPerformance from "./ClassPerformance";
import QuestionPerformanceCard from "./QuestionPerformanceCard";
import { Colors } from "../../../../constants/colors";



const scores = [95, 82, 76, 60, 88, 45, 91, 70, 55, 84,100,56,45,67,89, 99, 100, 75, 88, 88,89, 85,86];
const mostMissedQuestions = [
  { id: 'q7', question: 'Q7. Which is greater, 0.45 or 0.5?', incorrectPercent: 41 },
  { id: 'q3', question: 'Q3. What is 3/4 - 1/4?', incorrectPercent: 62 },
  { id: 'q10', question: 'Q10. Round 3.67 to the nearest tenth', incorrectPercent: 69 },
];



export default function OverviewTab() {
  return (
    <ScrollView contentContainerStyle={{padding: 10}}>
      <View style={{flex: 1, backgroundColor: Colors.neutralBg}}>
          <DetailsHeader />
          <LessonProgress totalLessons={17} finishedLessons={14}/>
          <ClassPerformance classAvg={85} passed={"29/32"} score={scores}/>
          <QuestionPerformanceCard
            correctAnswers={412}
            totalAnswers={480}
            mostMissedQuestions={mostMissedQuestions}
          />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
});