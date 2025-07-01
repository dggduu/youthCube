import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InputProfile from '../screens/RegisterScreen/inputProfile';
import ChoseLove from '../screens/RegisterScreen/choseLove';
import BoundStu from "../screens/RegisterScreen/boundStu";

const Stack = createNativeStackNavigator();

const RegisterFlow = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="inputProfile" component={InputProfile} />
      <Stack.Screen name="choseLove" component={ChoseLove} />
      <Stack.Screen name="boundStu" component={BoundStu} />
    </Stack.Navigator>
  );
};

export default RegisterFlow;