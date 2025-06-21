import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterStartScreen from '../screens/RegisterScreen/RegisterStartScreen';
import RegisterFlow from "../navigation/RegisterFlow";
import MainTabNavigator from "../navigation/MainTabNavigator";
import helperScreen from "../screens/helperScreen/helpScreen";


const Stack = createNativeStackNavigator();

const AuthStack = () => {
 return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterStart" component={RegisterStartScreen} />
      <Stack.Screen name="registerFlow" component={RegisterFlow}/>
      <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} />
      <Stack.Screen name='helpSolvor' component={helperScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;