import React, {useEffect} from 'react';
import {View, Image, ActivityIndicator, SafeAreaView, Text} from 'react-native';

//import useExternalStorage from "../hooks/useExternalStorage";

const SplashScreen = ({onFinish}) => {
    //const { isStorageAccessible, permissionStatus } = useExternalStorage();
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <SafeAreaView className='flex-1 justify-center self-cente'>
            {/* 加载指示器 */}
            <ActivityIndicator size="large" color="#007AFF" />
            {/* tip */}
            <Text className='text-lg font-semibold self-center mb-2 mt-7 dark:text-gray-200'>海内存知己，天涯若比邻</Text>
            <Text className='text-base self-center dark:text-gray-200'>好东西就要来了，请稍等...</Text>
        </SafeAreaView>
    );
};

export default SplashScreen;
