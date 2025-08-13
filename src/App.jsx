import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useSelector, useDispatch, Provider } from 'react-redux';
import store from './store/auth/authStore';
import { loadAuthData, fetchUserInfo } from './store/auth/authSlice';
import AuthStack from './navigation/AuthStack';
import MainNav from './navigation/MainNav';
import { ActivityIndicator, View, Text, useColorScheme, Linking, Platform } from 'react-native';
import { useToast } from './components/tip/ToastHooks';
import '../global.css';
import { BASE_INFO } from './constant/base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { navigationRef } from './navigation/NavigatorRef';
import checkAllPermissions from './utils/PermissionQuery';
import DeviceInfo from 'react-native-device-info';
import CustomAlert from "./components/custom/CustomAlert";
import semver from 'semver';

const RootAppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthReady, userData } = useSelector((state) => state.auth);
  const { showToast } = useToast();
  const [hasPermissions, setHasPermissions] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAlertVisible, setUpdateAlertVisible] = useState(false);
  const [updateAlertInfo, setUpdateAlertInfo] = useState({});
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  
  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      card: '#4a5563',
      text: '#ffffff',
    },
  };

  const appTheme = isDarkMode ? MyDarkTheme : DefaultTheme;

  const checkAppVersion = async () => {
    const TIMEOUT_MS = 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch('https://api.github.com/repos/dggduu/youthCube/releases/latest', {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`GitHub API响应失败，状态码: ${response.status}`);
      }

      const latestRelease = await response.json();
      const latestVersion = latestRelease.tag_name.startsWith('v') 
        ? latestRelease.tag_name.substring(1) 
        : latestRelease.tag_name;
      const currentVersion = DeviceInfo.getVersion();
      const updateBody = latestRelease.body;

      const latestCoerced = semver.coerce(latestVersion);
      const currentCoerced = semver.coerce(currentVersion);

      if (latestCoerced && currentCoerced && semver.gt(latestCoerced, currentCoerced)) {
        const releasePageUrl = latestRelease.html_url;

        setUpdateAlertInfo({
          title: '发现新版本',
          message: `当前版本：${currentVersion}\n最新版本：${latestVersion}\n\n更新内容：\n${updateBody}\n\n建议您更新以获得更好的体验。`,
          buttons: [
            { text: '取消', style: 'cancel', onPress: () => setUpdateAlertVisible(false) },
            {
              text: '立即更新',
              onPress: () => {
                Linking.openURL(releasePageUrl).catch(err =>
                  showToast('无法打开更新链接，请手动下载', 'error')
                );
                setUpdateAlertVisible(false);
              },
            },
          ],
        });
        setUpdateAlertVisible(true);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn('版本检查超时：', '网络连接不稳定或超时，跳过版本检查。');
      } else {
        console.error('版本检查失败：', error);
        showToast('版本检查失败', 'warning');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const permissionsGranted = await checkAllPermissions();
      setHasPermissions(permissionsGranted);
      
      if (!permissionsGranted) {
        setIsChecking(false);
        return;
      }
      
      await dispatch(loadAuthData()).unwrap();
      
      setIsUpdating(true);
      await checkAppVersion();
      
      setIsChecking(false);
    };

    initApp();
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
        <Text className='text-black dark:text-gray-300 mt-5'>
          {isUpdating ? '正在检查版本...' : '正在检查权限...'}
        </Text>
      </View>
    );
  }

  if (!hasPermissions) {
    return (
      <View className='flex-1 justify-center items-center bg-white dark:bg-gray-900 p-4'>
        <Text className='text-xl text-[#f56c6c] text-center mb-4'>
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
    <>
      <NavigationContainer ref={navigationRef} key={isAuthenticated ? 'main' : 'auth'} theme={appTheme}>
        {isAuthenticated ? <MainNav /> : <AuthStack />}
      </NavigationContainer>
      <CustomAlert
        visible={updateAlertVisible}
        title={updateAlertInfo.title}
        message={updateAlertInfo.message}
        buttons={updateAlertInfo.buttons}
        onClose={() => setUpdateAlertVisible(false)}
      />
    </>
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