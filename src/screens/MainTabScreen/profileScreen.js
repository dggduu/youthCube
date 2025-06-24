import React from 'react';
import { View, Text, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import { FlatGrid } from 'react-native-super-grid';

export default function ProfileScreen() {
  const isDark = useColorScheme() === 'dark';

  //我的学习 - 8 个子项，4 列 × 2 行
  const learningItems = [
    { icon: 'access-time', label: '练习记录' },
    { icon: 'group', label: '我的班级' },
    { icon: 'assignment', label: '学习周报' },
    { icon: 'list', label: '错题本' },
    { icon: 'chat', label: '聊天群组' },
    { icon: 'favorite', label: '我的收藏' },
    { icon: 'edit', label: '我的笔记' },
    { icon: 'publish', label: '我的投稿' },
  ];

  //我的运动 - 4 个子项，2 列 × 2 行
  const sportsItems = [
    { icon: 'directions-run', label: '开始运动', description: '开始今天的运动' },
    { icon: 'fitness-center', label: '运动记录', description: '查看运动记录' },
    { icon: 'show-chart', label: '传感器数据', description: '查看数据' },
    { icon: 'emoji-events', label: '运动竞赛', description: '和好友一起PK' },
  ];

  //其他选项
  const otherItems = [
    { icon: 'shopping-cart', label: '我的订单' },
    { icon: 'favorite', label: '推荐给好友' },
    { icon: 'thumb-up', label: '给个好评' },
    { icon: 'verified-user', label: '资质证照展示' },
  ];

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white dark:bg-black p-4">
        {/* 头部信息 */}
        <View className="flex-row items-center justify-between mb-6 ml-2 mt-5">
          <View className="flex-row items-center">
            <Image source={{ uri: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png' }} className="w-14 h-14 rounded-full" />
            <View className="ml-5">
              <Text className="text-lg font-bold text-gray-800 dark:text-white mb-1">写死了</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">小学一年级</Text>
            </View>
          </View>
          <View className="flex-row">
            <TouchableOpacity className='mr-4'>
              <MaterialIcon name="people" size={24} color={isDark ? '#A9A9A9' : '#888'} />
            </TouchableOpacity>
            <TouchableOpacity className='mr-2'>
              <MaterialIcon name="settings" size={24} color={isDark ? '#A9A9A9' : '#888'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 我的学习*/}
        <View className="bg-purple-100 dark:bg-purple-800/50 p-4 rounded-xl mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-300 mb-3 ml-2">我的学习</Text>
          <FlatGrid
            itemDimension={80}
            data={learningItems}
            spacing={10}
            renderItem={({ item }) => (
              <TouchableOpacity className="items-center">
                <MaterialIcon name={item.icon} size={24} color={isDark ? '#A9A9A9' : '#888'} />
                <Text className="mt-1 text-xs text-center dark:text-gray-300">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 我的运动*/}
        <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-4">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-300 mb-3 ml-2">我的运动</Text>
          <FlatGrid
            itemDimension={130}
            data={sportsItems}
            spacing={10}
            fixedItemsPerRow={2}
            renderItem={({ item }) => (
              <TouchableOpacity className="flex-row bg-gray-100 dark:bg-gray-800  rounded-md items-center">
                <MaterialIcon name={item.icon} size={24} color={isDark ? '#A9A9A9' : '#888'} />
                <View>
                  <Text className="ml-3 text-sm mb-1 font-bold text-left dark:text-gray-300">{item.label}</Text>
                  <Text className="ml-3 text-sm text-left dark:text-gray-300">{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 其他 */}
        <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
          <View className="space-y-3">
            {otherItems.map((item, idx) => (
              <TouchableOpacity key={idx} className="py-4 flex-row items-center ml-2">
                <MaterialIcon name={item.icon} size={22} color={isDark ? '#A9A9A9' : '#888'} />
                <Text className="ml-5 text-base dark:text-white">{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}