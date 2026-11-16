import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { KeyboardProvider} from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView} from 'react-native-safe-area-context';
import {
  useFonts,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito"
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'

import { Fredoka_400Regular } from '@expo-google-fonts/fredoka/400Regular';
import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka/700Bold';
import { ADMIN_EMAIL } from '../services/firebaseAuth';
import { auth } from '../services/firebaseConfig';
import AppErrorBoundary from '../components/AppErrorBoundary';

export default function RootLayout() {
 const [user, setUser] = useState(null);
 const [initializing, setInitializing] = useState(true);
 const router = useRouter();
 const segments = useSegments();
 const currentGroup = segments[0];

 const [fontsLoaded] = useFonts({
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold
});

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(
     auth,
     (currentUser) => {
       setUser(currentUser);
       setInitializing(false);
     },
     (error) => {
       console.error('Unable to restore sign-in session:', error);
       setUser(null);
       setInitializing(false);
     }
   );

   return unsubscribe;
 }, []);

 useEffect(() => {
   if (!fontsLoaded || initializing) return;

   const isAuthRoute = currentGroup === '(auth)';
   if (!user) {
     if (!isAuthRoute) router.replace('/login');
     return;
   }

   const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL;
   const destination = isAdmin ? '/Admin' : '/Screens/home';
   if (
     isAuthRoute ||
     !currentGroup ||
     currentGroup === 'index' ||
     (isAdmin && currentGroup !== 'Admin') ||
     (!isAdmin && currentGroup === 'Admin')
   ) {
     router.replace(destination);
   }
 }, [currentGroup, fontsLoaded, initializing, router, user]);

 if (!fontsLoaded) {
   console.log('Nunito is still loading...');
   return null;
 }

 if (initializing) {
   return null;
 }

 console.log('fonts are ready!');


  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <KeyboardProvider>
          <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right', 'bottom']}>
            <Stack screenOptions={{headerShown: false}} />
          </SafeAreaView>
        </KeyboardProvider>
    </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
