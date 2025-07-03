import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../..//screens/MainTabScreen/profileScreen';
import LearningNavigtor from '../profileNavigator/LearningNavigator';
import MiscNavigator from './MiscNavigator';
import TopBarNavigator from "./TopBarNavigator";
import HelperScreen from "../../screens/helperScreen/helpScreen";
import MainSettingNavigtor from "../../navigation/profileNavigator/MainSettingNavigtor";
import { calculateNewMassToMatchDuration } from 'react-native-reanimated/lib/typescript/animation/springUtils';
const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 默认显示 ProfileScreen */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      
      <Stack.Screen name="LearningNavigtor" component={LearningNavigtor} />
      <Stack.Screen name="MiscStack" component={MiscNavigator} />
      <Stack.Screen name="TopBar" component={TopBarNavigator}/>
      <Stack.Screen name="HelpScreen" component={HelperScreen} />

      <Stack.Screen name='SettingDetail' component={MainSettingNavigtor}/>
    </Stack.Navigator>
  );
}