import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import QualityShowScreen from "../../screens/MainTabScreen/ProfileScreen/MiscScreen/QualityShowScreen";

const Stack = createNativeStackNavigator();

export default function MiscNavigtor() {
    return (
        <Stack.Navigator screenOptions={{ headerShown:false }}>
            <Stack.Screen name="QualityCheck" component={QualityShowScreen}/>
        </Stack.Navigator>
    );
}