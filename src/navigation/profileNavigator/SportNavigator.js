import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SensorDataScreen from "../../screens/MainTabScreen/ProfileScreen/SportScreen/SensorDataSreen";
import SportLogScreen from "../../screens/MainTabScreen/ProfileScreen/SportScreen/SportLogScreen";
import SportPKScreen from "../../screens/MainTabScreen/ProfileScreen/SportScreen/SportPKScreen";
import StartSportScreen from "../../screens/MainTabScreen/ProfileScreen/SportScreen/StartSportScreen";

const Stack = createNativeStackNavigator();

export default function SportNavigtor() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SportData" component={SensorDataScreen} />
      <Stack.Screen name="Log" component={SportLogScreen} />
      <Stack.Screen name="PK" component={SportPKScreen} />
      <Stack.Screen name="StartSport" component={StartSportScreen} />
    </Stack.Navigator>
  );
}