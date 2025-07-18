// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useSelector, useDispatch, Provider } from 'react-redux';
import store from './store/auth/authStore';
import { loadAuthData, fetchUserInfo } from './store/auth/authSlice';
import AuthStack from './navigation/AuthStack';
import MainNav from './navigation/MainNav';
import { ActivityIndicator, View, Text, useColorScheme } from 'react-native';
import { useToast } from './components/tip/ToastHooks';
import '../global.css';
import { BASE_INFO } from './constant/base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { navigationRef } from './navigation/NavigatorRef';
import checkAllPermissions from './utils/PermissionQuery'; 

const RootAppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthReady, userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [hasPermissions, setHasPermissions] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  // 修改导航器在深色模式下的主题
  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      card: '#4a5563',
      text: '#ffffff',
    },
  };

  const appTheme = isDarkMode ? MyDarkTheme : DefaultTheme;
  useEffect(() => {
    const init = async () => {
      const permissionsGranted = await checkAllPermissions();
      setHasPermissions(permissionsGranted);
      setIsChecking(false);

      dispatch(loadAuthData());
    };

    init();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserInfo(userData.id));
      showToast('登录成功!', 'success');
    }
  }, [isAuthenticated, userData?.id]);

  if (isChecking) {
    return (
      <View className='flex-1 justify-center items-center bg-white dark:bg-gray-900'>
        <ActivityIndicator size='large' color='#0000ff' />
        <Text className='text-black dark:text-gray-300 mt-5'>正在检查权限...</Text>
      </View>
    );
  }

  if (!hasPermissions) {
    return (
      <View className='flex-1 justify-center items-center bg-white dark:bg-gray-900 p-4'>
        <Text className='text-xl text-red-500 text-center mb-4'>
          需要启用所有权限才能使用本应用
        </Text>
        <Text className='text-center text-gray-700 dark:text-gray-300'>
          请前往设置 > 应用设置 > 本应用 > 权限管理，启用所有权限后重试。
        </Text>
      </View>
    );
  }

  if (!isAuthReady) {
    return (
      <View className='flex-1 justify-center items-center bg-white dark:bg-gray-900'>
        <ActivityIndicator size='large' color='#0000ff' />
        <Text className='text-black dark:text-gray-300 mt-5'>正在加载数据中...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} key={isAuthenticated ? 'main' : 'auth'} theme={appTheme}>
      {isAuthenticated ? <MainNav /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  const queryClient = new QueryClient();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RootAppContent />
      </QueryClientProvider>
    </Provider>
  );
};

export default App;