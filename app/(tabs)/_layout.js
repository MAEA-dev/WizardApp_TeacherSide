import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TabsLayout(){

    return(
        <SafeAreaView style={{flex:1}} edges={["top","left", "right"]}>
            <Tabs screenOptions={{headerShown: false,}}> 
                <Tabs.Screen name="home" />
                <Tabs.Screen name="analytics"/>
                <Tabs.Screen name="profile"/>
            </Tabs>
        </SafeAreaView>

    );


}