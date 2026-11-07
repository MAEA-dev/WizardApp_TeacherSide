import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors , Opacity} from '../../constants/colors';
import { TextShadows } from '../../constants/shadows';
import { Fredoka } from '../../constants/fonts';
import AccountDrawer from './AccountDrawer';


export default function HomeHeader({
  name = "teacher Name",
  gender = "male",
  email = "",
}) {
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const router = useRouter();

  const firstLetter = name?.trim().charAt(0).toUpperCase() || '';
  const greeting = String(gender).trim().toLowerCase() === 'female' ? "Ma'am" : 'Sir';

  return (
      <View style={styles.container}>
        <View style={styles.header}>

         <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open account menu"
            onPress={() => setAccountMenuVisible(true)}
            style={styles.circle}
         >
            <Text style={styles.letter}>{firstLetter}</Text>
         </TouchableOpacity>

         <View style={{flex:1}}>
            <Text style={styles.greetingText}>Hello, {greeting}</Text>
           <Text style={styles.teacherNameText}>{name}</Text>
         </View>
      </View> 
      <AccountDrawer
        visible={accountMenuVisible}
        name={name}
        email={email}
        onClose={() => setAccountMenuVisible(false)}
        onSwitchUser={() => router.replace("/login")}
        onLogout={() => router.replace("/login")}
      />
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
    margin: 2,
   borderBottomLeftRadius: 25,
   borderBottomRightRadius: 25
  },
  header:{
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    gap:10
  },

  circle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.primary + Opacity[30]
    
  },

  letter: {
    fontFamily: Fredoka.bold,
    fontSize: 33,
    color: Colors.primary,
  },
  greetingText: {
    fontFamily: Fredoka.medium,
    fontSize: 14,
    color: Colors.bg,
    ...TextShadows.subtle

  },
  teacherNameText:{
    fontFamily: Fredoka.bold,
    fontSize: 22,
    textTransform: "capitalize",
    color: Colors.bg,
    ...TextShadows.medium
  },
});