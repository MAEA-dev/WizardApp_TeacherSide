import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors , Opacity} from '../../constants/colors';
import { Shadows, TextShadows } from '../../constants/shadows';
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
            <Text style={styles.greetingText}>Hello , {gender === "male" ? "Sir":"Ma'am"} </Text>
           <Text style={styles.teacherNameText}>{name}</Text>
         </View>
          <TouchableOpacity style={styles.button}>
              <Text style={styles.addText}>Add class</Text>
          </TouchableOpacity>
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
  button: {
    flexShrink: 0,
    backgroundColor: Colors.warning,
    padding: 10,
    borderRadius: 20,
    ...Shadows.large
  },
   addText:{
      fontFamily: Fredoka.semiBold,
      fontSize: 15,
      color: Colors.bg,
      ...TextShadows.subtle
  }
});