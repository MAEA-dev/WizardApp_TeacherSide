import { View, StyleSheet, ScrollView } from 'react-native';
import HomeHeader from '../../components/home/HomeHeader';
import SubjectCard from '../../components/home/SubjectCard';
import { Subjects } from '../../Mocks/subjects';
import { subjectColors, Colors } from '../../constant/colors';
import AnimatedView  from "../../components/Animation/AnimatedView"
import useScreenAnimationKey from '../../hooks/useScreenAnimationKey';

export default function Home() {
 const { playKey, hidden } = useScreenAnimationKey();


  return (
    <View style={styles.container}>
      <AnimatedView animation='slideDown' duration={500} delay={200}  playKey={playKey} hidden={hidden}>
        <HomeHeader />
      </AnimatedView>
      
      <ScrollView >
        <AnimatedView animation='slideUp' delay={500} duration={500} playKey={playKey}  style={{flex: 1} } hidden={hidden}> 
        <View style={styles.subjectGrid}>
          {Subjects.map((subject) =>( 
            <SubjectCard 
              key={subject.id}
              id = {subject.id}
              subjectName={subject.name}
              grade={subject.grade}
              color={subjectColors[subject.name] || '#64748B'}
            />
          ))}
        </View>
        </AnimatedView>
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