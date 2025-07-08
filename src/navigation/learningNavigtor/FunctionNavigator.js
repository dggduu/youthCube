import { createNativeStackNavigator } from "@react-navigation/native-stack";
import learningHomeScreen from "../../screens/MainTabScreen/learningHomeScreen";
import PostNavgator from "./PostNavigtor";
import CollectScreen from "../../screens/MainTabScreen/ProfileScreen/LearningScreen/CollectScreen";
import UploaderScreen from "../../screens/MainTabScreen/ProfileScreen/LearningScreen/UploaderScreen";
import React from 'react'

const Stack = createNativeStackNavigator();

const FunctionNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Post" component={PostNavgator}/>
        <Stack.Screen name="Collect" component={CollectScreen}/>
        <Stack.Screen name="Upload" component={UploaderScreen}/>
    </Stack.Navigator>
  )
}

export default FunctionNavigator