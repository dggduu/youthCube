import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OrderCheckScreen from "../../screens/MainTabScreen/ProfileScreen/MiscScreen/OrderCheckScreen";
import QualityShowScreen from "../../screens/MainTabScreen/ProfileScreen/MiscScreen/QualityShowScreen";
import RecommendFriendScreen from "../../screens/MainTabScreen/ProfileScreen/MiscScreen/RecommendFriendScreen";
import ThumbsUpScreen from "../../screens/MainTabScreen/ProfileScreen/MiscScreen/ThumbsUpScreen";

const Stack = createNativeStackNavigator();

export default function MiscNavigtor() {
    return (
        <Stack.Navigator screenOptions={{ headerShown:false }}>
            <Stack.Screen name="Order" component={OrderCheckScreen}/>
            <Stack.Screen name="QualityCheck" component={QualityShowScreen}/>
            <Stack.Screen name="Recommend" component={RecommendFriendScreen}/>
            <Stack.Screen name="ThumbsUp" component={ThumbsUpScreen}/>
        </Stack.Navigator>
    );
}