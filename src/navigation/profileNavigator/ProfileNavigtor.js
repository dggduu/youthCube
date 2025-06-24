import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../..//screens/MainTabScreen/profileScreen';
import LearningNavigtor from '../profileNavigator/LearningNavigator';
import SportNavigtor from '../profileNavigator/SportNavigator';
import MiscNavigator from './MiscNavigator';
import TopBarNavigator from "./TopBarNavigator";
const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 默认显示 ProfileScreen */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      
      <Stack.Screen name="LearningNavigtor" component={LearningNavigtor} />
      <Stack.Screen name="SportsStack" component={SportNavigtor} />
      <Stack.Screen name="MiscStack" component={MiscNavigator} />
      <Stack.Screen name="TopBar" component={TopBarNavigator}/>
    </Stack.Navigator>
  );
}