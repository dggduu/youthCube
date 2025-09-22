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
import { navigate } from '../../navigation/NavigatorRef'
import { GRADES } from '../../constant/index';

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userData, isAuthReady, isAuthenticated } = useSelector((state) => state.auth);

  const GRADES_MAP = GRADES.reduce((acc, current) => {
    acc[current.value] = current.label;
    return acc;
  }, {});

  const getLabelByValueFromMap = (value) => GRADES_MAP[value];

  const learningItems = [
    { 
      icon: 'chat', 
      label: '聊天群组', 
      action: () => navigate('RootIdea', { screen: 'Chat', params: { screen:'section' } }) 
    },
    { 
      icon: 'favorite', 
      label: '我的收藏', 
      action: () => navigate('RootLearn', { screen: 'Collect', params: { screen: 'IdeaMarket' } }) 
    },
    { 
      icon: 'publish', 
      label: '我的投稿', 
      action: () => navigate('RootLearn', { screen: 'Upload'}) 
    },
  ];

  const otherItems = [
    { 
      icon: 'verified-user', 
      label: '用户协议', 
      action: () => navigate('RootProfile', { screen: 'MiscStack', params: { screen: 'QualityCheck' } })
    },
    { 
      icon: 'help', 
      label: '帮助中心', 
      action: () => navigate('RootProfile', { screen: 'HelpScreen' })
    },
    { 
      icon: 'settings', 
      label: '设置', 
      action: () => navigate('RootProfile', { screen: 'TopBar', params: { screen:"Setting"} })
    },
  ];

  const renderSection = (title, items) => (
    <View className={`rounded-2xl p-5 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <Text className="text-lg font-semibold mb-2 ml-1 text-neutral-800 dark:text-white">
        {title}
      </Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          className={`flex-row items-center justify-between py-4 ${
            index < items.length - 1 && 'border-b border-gray-200 dark:border-gray-700'
          }`}
          onPress={item.action}
        >
          <View className="flex-row items-center">
            <MaterialIcon
              name={item.icon}
              size={24}
              color={isDark ? '#A9A9A9' : '#666'}
            />
            <Text className="text-base ml-4 text-neutral-800 dark:text-white">
              {item.label}
            </Text>
          </View>
          <MaterialIcon
            name="chevron-right"
            size={24}
            color={isDark ? '#A9A9A9' : '#9ca3af'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaProvider>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 pt-4 pb-8">
          <View
            className={`py-8 px-4 rounded-2xl mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
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
                  source={require("../../assets/logo/ava.png")}
                  className="w-16 h-16 rounded-full"
                />
                <View className="ml-4">
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text className="text-xl font-bold dark:text-white mr-2">
                      {userData.name}
                    </Text>
                  </View>
                  <Text className="text-sm mt-1 text-neutral-500 dark:text-gray-300">
                    {getLabelByValueFromMap(userData.learn_stage)}
                  </Text>
                </View>
              </View>
              <View className="flex-row mr-1">
                <TouchableOpacity
                  className="mr-4"
                  onPress={() => navigate('RootProfile', { screen: 'TopBar', params: {screen:"Message"} })}
                >
                  <MaterialIcon name="more-vert" size={24} color={isDark ? '#A9A9A9' : '#888'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {renderSection('我的学习', learningItems)}
          
          {renderSection('其他', otherItems)}
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}