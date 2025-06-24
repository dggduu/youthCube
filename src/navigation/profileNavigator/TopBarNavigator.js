import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainSettingScreen from '../../screens/MainTabScreen/ProfileScreen/MainSettingScreen';
import MessageScreen from '../../screens/MainTabScreen/ProfileScreen/MessageScreen';

const Stack = createNativeStackNavigator();

export default function TopBarNavigtor() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Setting" component={MainSettingScreen} />
      <Stack.Screen name="Message" component={MessageScreen} />
    </Stack.Navigator>
  );
}