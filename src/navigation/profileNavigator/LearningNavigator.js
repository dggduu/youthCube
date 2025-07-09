import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PracticeScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/PracticeScreen';
import ClassInfoScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/ClassInfoScreen';
import CollectScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/CollectScreen';
import CorrectBookScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/CorrectBookScreen';
import NoteScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/NoteScreen';
import WeeklyReportScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/WeeklyReportScreen';
import ChatGroupScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/ChatGroupScreen';
import UploaderScreen from '@screens/MainTabScreen/ProfileScreen/LearningScreen/UploaderScreen';

import CollectNavigator from "../../navigation/learningNavigtor/collectNavigtor";

const Stack = createNativeStackNavigator();

export default function LearningNavigtor() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pratice" component={PracticeScreen} />
      <Stack.Screen name="ClassInfo" component={ClassInfoScreen} />
      <Stack.Screen name="Collect" component={CollectNavigator} />
      <Stack.Screen name="CorrectBook" component={CorrectBookScreen} />
      <Stack.Screen name="Note" component={NoteScreen} />
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
      <Stack.Screen name="ChatGroup" component={ChatGroupScreen} />
      <Stack.Screen name="Uploader" component={UploaderScreen} />
    </Stack.Navigator>
  );
}