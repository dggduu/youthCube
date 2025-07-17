import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React from 'react'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BackIcon from "../../../components/backIcon/backIcon";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/auth/authSlice';
import { useColorScheme } from 'nativewind';
import { useNavigation } from "@react-navigation/native";
const SettingItem = ({ description, iconName, onPress }) => {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
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

const MainSetting = ( {navigation} ) => {
  const dispatch = useDispatch();

  const handlePressNotifications = () => {
    Alert.alert("通知", "前面的道路以后再来探索吧");
  };

  const handlePressLogout = () => {
    Alert.alert(
      "登出",
      "您确定要登出吗？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确定",
          onPress: () => {
            dispatch(logout());
          }
        }
      ]
    );
  };

  return (
    <KeyboardAwareScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <BackIcon/>
      <Text className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-5 mb-8 px-5">设置</Text>

      {/* 通用设置部分 */}
      <Text className="text-lg font-bold text-gray-600 dark:text-gray-300 mt-5 mb-2 px-5">通用设置</Text>
      <SettingItem
        description="账户信息修改"
        iconName="security"
        onPress={() => navigation.navigate('SettingDetail', { screen: 'UserInfoChange' })}
      />
      <SettingItem
        description="通知设置"
        iconName="notifications"
        onPress={handlePressNotifications}
      />
      <SettingItem
        description="隐私政策"
        iconName="privacy-tip"
        onPress={() => navigation.navigate('SettingDetail', { screen: 'PolicyInfo' })}
      />
      {/* <SettingItem
        description="语言"
        iconName="language"
        onPress={() => Alert.alert("导航", "选择应用语言")}
      /> */}

      {/* 关于我们部分 */}
      <Text className="text-lg font-bold text-gray-600 dark:text-gray-300 mt-5 mb-2 px-5">关于</Text>
      <SettingItem
        description="关于我们"
        iconName="info"
        onPress={() => navigation.navigate('SettingDetail', { screen: 'PartyInfo' })}
      />
      {/* <SettingItem
        description="版本信息"
        iconName="build"
        onPress={() => navigation.navigate('SettingDetail', { screen: 'VersionInfo' })}
      /> */}

      {/* 增加底部间距，防止内容被底部导航栏或其他元素遮挡 */}
      <View className="h-10" /> 

      {/* 登出按钮 */}
      <SettingItem
        description="登出"
        iconName="logout"
        onPress={handlePressLogout}
      />
    </KeyboardAwareScrollView>
  );
};

export default MainSetting;