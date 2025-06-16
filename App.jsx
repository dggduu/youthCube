import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store/store';
import AuthNavigator from './src/navigators/AuthNavigator'; // 新增的导航器

const RootApp = () => {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <RootApp />
    </Provider>
  );
};

export default App;