// async Storage 函数封装
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getItemFromAsyncStorage = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error(`AsyncStorage.getItem Error "${key}":`, e);
        return null;
    }
};

export const setItemToAsyncStorage = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
        return {message:"ok"}
    } catch (e) {
        console.error(`AsyncStorage.setItem error for key "${key}":`, e);
    }
};

export const removeItemFromAsyncStorage = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error(`AsyncStorage.removeItem error for key "${key}":`, e);
    }
};

export const clearAllAsyncStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared successfully.');
    } catch (e) {
        console.error('AsyncStorage.clear error:', e);
    }
};