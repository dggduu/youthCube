import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useSelector } from 'react-redux';

import CrownIcon from '../../assets/registerScreen/crown.svg';
import { GRADES } from '../../constant/index';

export default function ProfileScreen({ navigation }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userData, isAuthReady, isAuthenticated } = useSelector((state) => state.auth);

  // 构建等级 label 映射表
  const GRADES_MAP = GRADES.reduce((acc, current) => {
    acc[current.value] = current.label;
    return acc;
  }, {});

  const getLabelByValueFromMap = (value) => GRADES_MAP[value];

  // 学习模块数据
  const learningItems = [
    { icon: 'chat', label: '聊天群组', screen: 'LearningNavigtor', params: { screen: 'ChatGroup' } },
    { icon: 'favorite', label: '我的收藏', screen: 'LearningNavigtor', params: { screen: 'Collect' } },
    { icon: 'edit', label: '我的笔记', screen: 'LearningNavigtor', params: { screen: 'Note' } },
    { icon: 'publish', label: '我的投稿', screen: 'LearningNavigtor', params: { screen: 'Uploader' } },
  ];

  // 其他设置项
  const otherItems = [
    { icon: 'verified-user', label: '用户协议', screen: 'MiscStack', params: { screen: 'QualityCheck' } },
    { icon: 'help', label: '帮助中心', screen: 'HelpScreen'},
    { icon: 'logout', label: '退出登录', screen: 'AuthStack', params: { screen: 'Login' } },
  ];

  return (
    <SafeAreaProvider style={{ backgroundColor: isDark ? '#121212' : '#f9f9f9' }}>
      <ScrollView className="flex-1">
        <View className="px-1 pt-4 pb-8" style={{ maxWidth: 900, alignSelf: 'center' }}>

          {/* --- 用户信息卡片 --- */}
          <View
            className={`p-8 rounded-2xl mb-6 shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              elevation: 2,
              shadowColor: isDark ? '#000' : '#ccc',
              shadowOpacity: 0.1,
              shadowRadius: 6,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center mr-24">
                <Image
                  source={{ uri: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png' }}
                  className="w-16 h-16 rounded-full"
                />
                <View className="ml-4">
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text className="text-xl font-bold dark:text-white mr-2">
                      {userData.name}
                    </Text>
                    <CrownIcon
                      width={20}
                      height={20}
                      fill={userData.is_member ? (isDark ? '#B89230' : '#DA954B') : isDark ? '#ddd' : '#000'}
                    />
                  </View>
                  <Text className="text-sm mt-1 text-neutral-500 dark:text-gray-300">
                    {getLabelByValueFromMap(userData.learn_stage)}
                  </Text>
                </View>
              </View>
              <View className="flex-row">
                <TouchableOpacity
                  className="mr-4"
                  onPress={() => navigation.navigate('TopBar', { screen: 'Message' })}
                >
                  <MaterialIcon name="people" size={24} color={isDark ? '#A9A9A9' : '#888'} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TopBar', { screen: 'Setting' })}
                >
                  <MaterialIcon name="settings" size={24} color={isDark ? '#A9A9A9' : '#888'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* --- 我的学习模块：垂直列表形式 --- */}
          <View
            className={`p-5 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <Text className="text-lg font-semibold mb-4 ml-1 text-neutral-800 dark:text-white">
              我的学习
            </Text>

            <View className="gap-3">
              {learningItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center p-4 rounded-xl ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                  onPress={() => navigation.navigate(item.screen, item.params)}
                >
                  <MaterialIcon name={item.icon} size={24} color={isDark ? '#A9A9A9' : '#666'} />
                  <Text className="text-base ml-4 text-neutral-800 dark:text-white">
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* --- 设置和其他选项 --- */}
          <View
            className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {otherItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <TouchableOpacity
                  className="flex-row items-center px-4 py-4"
                  onPress={() => navigation.navigate(item.screen, item.params)}
                >
                  <MaterialIcon name={item.icon} size={22} color={isDark ? '#A9A9A9' : '#888'} />
                  <Text className="text-base ml-5 text-neutral-800 dark:text-white">
                    {item.label}
                  </Text>
                </TouchableOpacity>
                {idx !== otherItems.length - 1 && (
                  <View className={`h-[1px] mx-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </View>

        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}