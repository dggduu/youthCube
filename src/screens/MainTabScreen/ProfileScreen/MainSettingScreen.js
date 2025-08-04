import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackIcon from '../../../components/backIcon/backIcon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/auth/authSlice';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../../../components/custom/CustomAlert';

const SettingItem = ({ description, iconName, onPress }) => {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#D1D5DB' : '#333';
  const chevronColor = colorScheme === 'dark' ? '#9CA3AF' : '#555';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-5 bg-white dark:bg-gray-700 rounded-xl mb-3 mx-4 shadow-sm"
    >
      <View className="flex-row items-center flex-1">
        {iconName && (
          <MaterialIcons name={iconName} size={24} color={iconColor} className="mr-4" />
        )}
        <Text className="text-base text-gray-800 dark:text-gray-200">{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={chevronColor} />
    </TouchableOpacity>
  );
};

const MainSetting = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);

  const handlePressLogout = () => {
    setAlertVisible(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    setAlertVisible(false);
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  return (
    <KeyboardAwareScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <BackIcon />
      <Text className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-5 mb-8 px-5">
        设置
      </Text>

      {/* 通用设置部分 */}
      <Text className="text-lg font-bold text-gray-600 dark:text-gray-300 mt-5 mb-2 px-5">
        通用设置
      </Text>
      <SettingItem
        description="账户信息修改"
        iconName="security"
        onPress={() => navigation.navigate('SettingDetail', { screen: 'UserInfoChange' })}
      />
      <SettingItem
        description="隐私政策"
        iconName="privacy-tip"
        onPress={() => navigation.navigate('SettingDetail', { screen: 'PolicyInfo' })}
      />
      
      {/* 关于我们部分 */}
      <Text className="text-lg font-bold text-gray-600 dark:text-gray-300 mt-5 mb-2 px-5">
        关于
      </Text>
      <SettingItem
        description="关于我们"
        iconName="info"
        onPress={() => navigation.navigate('SettingDetail', { screen: 'PartyInfo' })}
      />

      <View className="h-10" />

      {/* 登出按钮 */}
      <SettingItem
        description="登出"
        iconName="logout"
        onPress={handlePressLogout}
      />

      {/* 自定义登出确认弹窗 */}
      <CustomAlert
        visible={alertVisible}
        title="登出"
        message="您确定要登出吗？"
        onClose={handleCloseAlert}
        buttons={[
          {
            text: '取消',
            style: 'cancel',
          },
          {
            text: '确定',
            style: 'destructive',
            onPress: handleConfirmLogout,
          },
        ]}
      />
    </KeyboardAwareScrollView>
  );
};

export default MainSetting;