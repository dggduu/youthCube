import { useState, useEffect } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Hook：用于请求 Android 外部存储权限并检查访问能力(废弃)
 */
const useExternalStorage = () => {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isStorageAccessible, setIsStorageAccessible] = useState(false);

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      setIsStorageAccessible(true);
      setPermissionStatus('granted');
      return;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '存储权限请求',
          message: '本应用需要访问您的存储以下载和保存文件',
          buttonNeutral: '稍后再说',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('权限已授予');
        setPermissionStatus('granted');
      } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
        console.log('权限被拒绝');
        setPermissionStatus('denied');
        ToastAndroid.show('需要权限才能继续使用', ToastAndroid.LONG);
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log('用户选择了“不再询问”');
        setPermissionStatus('blocked');
        ToastAndroid.show('请前往设置开启权限', ToastAndroid.LONG);
      }
    } catch (err) {
      console.warn('请求权限出错:', err);
    }
  };

  // 检查是否可以访问外部存储
  const checkStorageAccessibility = async () => {
    if (permissionStatus !== 'granted') {
      setIsStorageAccessible(false);
      return;
    }

    try {
      const dirPath = `${RNFS.DownloadDirectoryPath}/MyAppFolder`;

      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        await RNFS.mkdir(dirPath);
      }

      const finalExists = await RNFS.exists(dirPath);
      setIsStorageAccessible(finalExists);
    } catch (err) {
      console.error('无法访问存储:', err.message);
      setIsStorageAccessible(false);
    }
  };

  // Effect: 请求权限
  useEffect(() => {
    requestStoragePermission();
  }, []);

  // Effect: 检查存储访问状态
  useEffect(() => {
    if (permissionStatus === 'granted') {
      checkStorageAccessibility();
    }
  }, [permissionStatus]);

  return { isStorageAccessible, permissionStatus };
};

export default useExternalStorage;