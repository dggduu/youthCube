// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch, Provider } from 'react-redux';
import store from './store/auth/authStore';
import { loadAuthData, fetchUserInfo } from './store/auth/authSlice';

import AuthStack from './navigation/AuthStack';
import MainTabNavigator from './navigation/MainTabNavigator';
import { ActivityIndicator, View, Text } from 'react-native';
import { useToast } from "./components/tip/ToastHooks";
import '../global.css' 
import { BASE_INFO } from "./constant/base";

const RootAppContent = () => {
    const dispatch = useDispatch();
    // 从 Redux中获取认证相关的状态
    const { isAuthenticated, isAuthReady, userData } = useSelector((state) => state.auth);
    const {showToast} = useToast();
    useEffect(() => {
        dispatch(loadAuthData());
    }, [dispatch]);


    useEffect(() => {
      if(isAuthenticated) {
        dispatch(fetchUserInfo(userData.id));
        showToast("登录成功!","success");
      }
    }, [isAuthenticated, isAuthReady, userData?.id]);

    if (!isAuthReady) {
        return (
            <View className='flex-1 justify-center items-center bg-white dark:bg-gray-600'>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className='text-black dark:text-gray-300 mt-5'>正在加载数据中...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainTabNavigator /> : <AuthStack />}
        </NavigationContainer>
    );
};

const App = () => {
    return (
        <Provider store={store}>
            <RootAppContent />
        </Provider>
    );
};
export default App;