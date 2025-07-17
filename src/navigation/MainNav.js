import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from "../navigation/MainTabNavigator";

import ProfileNavigtor from "../navigation/profileNavigator/ProfileNavigtor";
import FunctionNavigator from "./learningNavigtor/FunctionNavigator";
import TeamNavigtor from "./ideaMaketNavigtor/TeamNavigtor";
const Stack = createNativeStackNavigator();

const MainNav = () => {
 return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} />
      <Stack.Screen name="RootIdea" component={TeamNavigtor} />
      <Stack.Screen name="RootLearn" component={FunctionNavigator} />
      <Stack.Screen name="RootProfile" component={ProfileNavigtor} />
    </Stack.Navigator>
  );
};

export default MainNav;