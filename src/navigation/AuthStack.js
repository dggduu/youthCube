import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterStartScreen from '../screens/RegisterScreen/RegisterStartScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
 return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterStart" component={RegisterStartScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;