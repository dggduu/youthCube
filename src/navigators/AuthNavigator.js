import React from 'react';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from '../pages/loginPage/loginPage'
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import MainPage from '..//pages/MainPage/MainPage';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainPage} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Register" component={RegisterPage} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;