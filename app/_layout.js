import {Stack} from 'expo-router';
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
export default function RootLayout() {

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

 if (!fontsLoaded) {
   console.log('Nunito is still loading...');
   return null;
 }

 console.log('fonts are ready!');


  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right', 'bottom']}>
          <Stack screenOptions={{headerShown: false}}>
            
          </Stack>
          </SafeAreaView>
        </KeyboardProvider>
    </SafeAreaProvider>
  );
}