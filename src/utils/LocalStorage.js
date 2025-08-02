// async Storage 函数封装
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 从 AsyncStorage 获取数据
 * @param {string} key 要获取数据的键
 * @returns {Promise<any | null>} 键对应的值
 */
export const getItemFromAsyncStorage = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error(`AsyncStorage.getItem Error "${key}":`, e);
        return null;
    }
};

/**
 * 将数据保存到 AsyncStorage
 * @param {string} key 要保存数据的键
 * @param {any} value 要保存的值(stringfy处理)
 * @returns {Promise<void>}
 */
export const setItemToAsyncStorage = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
        return {message:"ok"}
    } catch (e) {
        console.error(`AsyncStorage.setItem error for key "${key}":`, e);
    }
};

/**
 * 从 AsyncStorage 删除数据
 * @param {string} key 要删除数据的键
 * @returns {Promise<void>}
 */
export const removeItemFromAsyncStorage = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error(`AsyncStorage.removeItem error for key "${key}":`, e);
    }
};

/**
 * 清除 AsyncStorage 中的所有数据
 * @returns {Promise<void>}
 */
export const clearAllAsyncStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared successfully.');
    } catch (e) {
        console.error('AsyncStorage.clear error:', e);
    }
};