import { View, StyleSheet, ScrollView } from 'react-native';
import HomeHeader from '../../components/home/HomeHeader';
import SubjectCard from '../../components/home/SubjectCard';
import { Subjects } from '../../Mocks/subjects';
import { subjectColors, Colors } from '../../constant/colors';



export default function Home() {
  return (
    <View style={styles.container}>
      <HomeHeader />
      <ScrollView>
        <View style={styles.subjectGrid}>
          {Subjects.map((subject) =>( 
            <SubjectCard 
              key={subject.id}
              subjectName={subject.name}
              grade={subject.grade}
              color={subjectColors[subject.name] || '#64748B'}
            />
          ))}

        </View>
        



      </ScrollView>
    </View>
  );
}   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutralBg
  },
  subjectGrid:{
    flexDirection: "column",
  }
});