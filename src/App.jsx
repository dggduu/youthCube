import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './navigation/AuthStack';
import MainTabNavigator from './navigation/MainTabNavigator';
import { useSelector } from 'react-redux';
import { DEV } from '@env';
import SplashScreen from "./screens/SplashScreen";


import '../global.css'

const App = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  if (!isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default App;
