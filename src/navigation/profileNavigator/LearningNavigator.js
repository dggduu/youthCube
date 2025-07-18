import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatGroupScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/ChatGroupScreen';
import UploaderScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/UploaderScreen';
import CollectNavigator from "../../navigation/learningNavigtor/collectNavigtor";

const Stack = createNativeStackNavigator();

export default function LearningNavigtor() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Collect" component={CollectNavigator} />
      <Stack.Screen name="ChatGroup" component={ChatGroupScreen} />
      <Stack.Screen name="Uploader" component={UploaderScreen} />
    </Stack.Navigator>
  );
}