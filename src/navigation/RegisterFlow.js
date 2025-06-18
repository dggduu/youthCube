import { createNativeStackNavigator } from '@react-navigation/native-stack';
import inputProfile from '../screens/RegisterScreen/inputProfile';
import choseLove from '../screens/RegisterScreen/choseLove';
import boundStu from "../screens/RegisterScreen/boundStu";

const Stack = createNativeStackNavigator();

const RegisterFlow = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="inputProfile" component={inputProfile} />
      <Stack.Screen name="choseLove" component={choseLove} />
      <Stack.Screen name="boundStu" component={boundStu} />
    </Stack.Navigator>
  );
};

export default RegisterFlow;