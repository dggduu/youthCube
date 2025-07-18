import { PermissionsAndroid, Platform } from 'react-native';

const REQUIRED_PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  PermissionsAndroid.PERMISSIONS.CAMERA,
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
];

const checkAllPermissions = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const results = await PermissionsAndroid.requestMultiple(REQUIRED_PERMISSIONS);

    const allDenied = Object.values(results).every(
      (result) => result === PermissionsAndroid.RESULTS.DENIED || PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    );

    if (allDenied) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
};

export default checkAllPermissions;