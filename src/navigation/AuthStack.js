import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterFlow from "../navigation/RegisterFlow";
import MainTabNavigator from "../navigation/MainTabNavigator";
import HelperScreen from "../screens/helperScreen/helpScreen";

import FindPswdScreen from "../screens/RegisterScreen/FindPswdScreen";
const Stack = createNativeStackNavigator();

const AuthStack = () => {
 return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="registerFlow" component={RegisterFlow}/>
      <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} />
      <Stack.Screen name='helpSolvor' component={HelperScreen} />
      <Stack.Screen name='FindPswd' component={FindPswdScreen} />

    </Stack.Navigator>
  );
};

export default AuthStack;