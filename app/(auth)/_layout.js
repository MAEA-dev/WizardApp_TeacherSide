import {Stack} from 'expo-router';
import { SafeAreaView} from 'react-native-safe-area-context';

export default function AuthLayout(){
    return(
           
          <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right', 'bottom']}>
               <Stack screenOptions={{headerShown: false, animation: "none"}} >
                 <Stack.Screen name="login" />
                 <Stack.Screen name="register" />
               </Stack>
             </SafeAreaView>
        
    );
    
}