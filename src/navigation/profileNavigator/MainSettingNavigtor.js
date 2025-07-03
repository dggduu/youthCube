import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import PartyInfo from "../../screens/MainTabScreen/ProfileScreen/SettingScreen/PartyInfo";
import VersionInfo from "../../screens/MainTabScreen/ProfileScreen/SettingScreen/VersionInfo";
import PolicyInfo from "../../screens/MainTabScreen/ProfileScreen/SettingScreen/PolicyInfo";
const Stack = createNativeStackNavigator();

export default function MainSettingNavigtor() {
    return (
        <Stack.Navigator screenOptions={{ headerShown:false }}>
            <Stack.Screen name="Version" component={VersionInfo}/>
            <Stack.Screen name="PartyInfo" component={PartyInfo}/>
            <Stack.Screen name="PolicyInfo" component={PolicyInfo}/>

        </Stack.Navigator>
    );
}