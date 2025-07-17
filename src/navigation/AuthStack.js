import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterFlow from "../navigation/RegisterFlow";
import MainTabNavigator from "../navigation/MainTabNavigator";
import HelperScreen from "../screens/helperScreen/helpScreen";

import ProfileNavigtor from "../navigation/profileNavigator/ProfileNavigtor";
import PostNavgator from "./learningNavigtor/PostNavigtor";
import FunctionNavigator from "./learningNavigtor/FunctionNavigator";
import TeamNavigtor from "./ideaMaketNavigtor/TeamNavigtor";
import { navigationRef } from './NavigatorRef';
const Stack = createNativeStackNavigator();

const AuthStack = () => {
 return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="registerFlow" component={RegisterFlow}/>
      <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} />
      <Stack.Screen name='helpSolvor' component={HelperScreen} />
{/* 
      <Stack.Screen name="RootIdea" component={TeamNavigtor} />
      <Stack.Screen name="RootLearn" component={FunctionNavigator} />
      <Stack.Screen name="RootProfile" component={ProfileNavigtor} /> */}
    </Stack.Navigator>
  );
};

export default AuthStack;