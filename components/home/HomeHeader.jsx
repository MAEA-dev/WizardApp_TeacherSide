import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constant/colors';

export default function HomeHeader({name="teacher Name"}) {

  const firstLetter = name?.trim().charAt(0).toUpperCase() || '';

  return (
      <View style={styles.container}>
        <View style={styles.header}>

         <View style={styles.circle}>
            <Text style={styles.letter}>{firstLetter}</Text>
         </View>

         <View>
            <Text>Hello </Text>
           <Text>{name}</Text>
         </View>

      </View> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    minHeight: 90,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    margin: 1,
  },
  header:{
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    gap:10
  },

  circle: {
    width: 60,
    height: 60,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  letter: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    
  },
});