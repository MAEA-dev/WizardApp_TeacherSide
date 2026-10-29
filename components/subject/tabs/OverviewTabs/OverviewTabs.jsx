import { View, Text, StyleSheet , ScrollView } from "react-native";
import LessonProgress from "./LessonProgress";
import DetailsHeader from "./DetailsHeader";
import { Colors } from "../../../../constant/colors";







export default function OverviewTab() {
  return (
    <ScrollView contentContainerStyle={{padding: 10}}>
      <View style={{flex: 1, backgroundColor: Colors.neutralBg}}>
          <DetailsHeader />
          <LessonProgress totalLessons={17} finishedLessons={14}/>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
});