import {Stack} from 'expo-router';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function AuthLayout(){
    return(
           <SafeAreaProvider>
             <SafeAreaView>
               <Stack screenOptions={{headerShown: false}}>
                 <Stack.Screen name="login" />
                 <Stack.Screen name="register" />
               </Stack>
             </SafeAreaView>
           </SafeAreaProvider>
    );
    
}