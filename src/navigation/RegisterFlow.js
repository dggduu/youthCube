import { createStackNavigator } from '@react-navigation/stack';
import VerifyPhoneScreen from '../screens/VerifyPhoneScreen';
import FillInfoScreen from '../screens/FillInfoScreen';
import ChoosePreferenceScreen from '../screens/ChoosePreferenceScreen';

const Stack = createStackNavigator();

const RegisterFlow = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
      <Stack.Screen name="FillInfo" component={FillInfoScreen} />
      <Stack.Screen name="ChoosePreference" component={ChoosePreferenceScreen} />
    </Stack.Navigator>
  );
};