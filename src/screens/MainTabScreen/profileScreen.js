import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';
import { useColorScheme } from 'nativewind';
import { useSelector } from 'react-redux';

import CrownIcon from "../../assets/registerScreen/crown.svg";
import { GRADES } from "../../constant/index";

export default function ProfileScreen({ navigation }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userData, isAuthReady, isAuthenticated } = useSelector((state) => state.auth);
  const GRADES_MAP = GRADES.reduce((acc, current) => {
      acc[current.value] = current.label;
      return acc;
  }, {});
  function getLabelByValueFromMap(value) {
    return GRADES_MAP[value];
}
  const learningItems = [
    { icon: 'access-time', label: '练习记录', screen: 'LearningNavigtor', params: { screen: 'Pratice' } },
    { icon: 'group', label: '我的班级', screen: 'LearningNavigtor', params: { screen: 'ClassInfo' } },
    { icon: 'assignment', label: '学习周报', screen: 'LearningNavigtor', params: { screen: 'WeeklyReport' } },
    { icon: 'list', label: '错题本', screen: 'LearningNavigtor', params: { screen: 'CorrectBook' } },
    { icon: 'chat', label: '聊天群组', screen: 'LearningNavigtor', params: { screen: 'ChatGroup' } },
    { icon: 'favorite', label: '我的收藏', screen: 'LearningNavigtor', params: { screen: 'Collect' } },
    { icon: 'edit', label: '我的笔记', screen: 'LearningNavigtor', params: { screen: 'Note' } },
    { icon: 'publish', label: '我的投稿', screen: 'LearningNavigtor', params: { screen: 'Uploader' } },
  ];

  const sportsItems = [
    { icon: 'directions-run', label: '开始运动', description: '开始今天的运动', screen: 'SportsStack', params: { screen: 'StartSport' } },
    { icon: 'fitness-center', label: '运动记录', description: '查看运动记录', screen: 'SportsStack', params: { screen: 'Log' } },
    { icon: 'show-chart', label: '传感器数据', description: '查看数据', screen: 'SportsStack', params: { screen: 'SportData' } },
    { icon: 'emoji-events', label: '运动竞赛', description: '和好友一起PK', screen: 'SportsStack', params: { screen: 'PK' } },
  ];

  const otherItems = [
    { icon: 'shopping-cart', label: '我的订单', screen: 'MiscStack', params: { screen: 'Order' } },
    { icon: 'favorite', label: '推荐给好友', screen: 'MiscStack', params: { screen: 'Recommend' } },
    { icon: 'thumb-up', label: '给个好评', screen: 'MiscStack', params: { screen: 'ThumbsUp' } },
    { icon: 'verified-user', label: '资质证照展示', screen: 'MiscStack', params: { screen: 'QualityCheck' } },
  ];
  const dummyData = [{ key: 'dummy' }];

  return (
    <SafeAreaProvider style={{ backgroundColor: isDark ? 'black' : 'white' }}>
      <View className='flex-1 justify-center self-center ' style={{maxWidth: 520}}>
        <FlatList
          data={dummyData}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-white dark:bg-black p-5"
          renderItem={() => null}
          ListHeaderComponent={() => (
            <View>
              {/* Header Info */}
              <View className="flex-row justify-between items-center mb-6 ml-2 mt-5">
                <View className="flex-row items-center">
                  <Image source={{ uri: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png' }} className="w-14 h-14 rounded-full" />
                  <View className="ml-5">
                   <View style={{flexDirection: 'row'}}>
                    <Text className="text-lg font-semibold text-dark dark:text-gray-200 mr-2">{userData.name}</Text>
                    <CrownIcon width={18} height={18} fill={userData.is_member ? isDark ? "#B89230": "#DA954B" : isDark ? "#ddd" : "#000"}/>
                  </View>
                    <Text className="text-sm text-neutral-500 dark:text-gray-300">{getLabelByValueFromMap(userData.learn_stage)}</Text>
                  </View>
                </View>
                <View className="flex-row">
                  <TouchableOpacity className="mr-4" onPress={() => navigation.navigate('TopBar', { screen: 'Message' })}>
                    <MaterialIcon name="people" size={24} color={isDark ? '#A9A9A9' : '#888'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('TopBar', { screen: 'Setting' })}>
                    <MaterialIcon name="settings" size={24} color={isDark ? '#A9A9A9' : '#888'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 我的学习 */}
              <View className="bg-[#c5ecce] dark:bg-[#2c4e38] p-4 rounded-3xl mb-4">
                <Text className="text-lg font-bold mb-3 ml-2 text-neutral-800 dark:text-neutral-300">我的学习</Text>
                <FlatGrid
                  itemDimension={80}
                  data={learningItems}
                  spacing={10}
                  scrollEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity className="items-center" onPress={() => navigation.navigate(item.screen, item.params)}>
                      <MaterialIcon name={item.icon} size={24} color={isDark ? '#A9A9A9' : '#666'} />
                      <Text className="text-xs text-center text-neutral-800 dark:text-neutral-300 mt-1">{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* 我的运动 */}
              <View className="bg-[#eee2bc] dark:bg-[#4e472a] p-4 rounded-3xl mb-4">
                <Text className="text-lg font-bold mb-3 ml-2 text-neutral-700 dark:text-neutral-300">我的运动</Text>
                <FlatGrid
                  itemDimension={130}
                  data={sportsItems}
                  spacing={10}
                  fixedItemsPerRow={2}
                  scrollEnabled={false} 
                  showsHorizontalScrollIndicator={false} 
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="flex-row items-center p-3"
                      onPress={() => navigation.navigate(item.screen, item.params)}
                    >
                      <MaterialIcon name={item.icon} size={24} color={isDark ? '#A9A9A9' : '#888'} />
                      <View>
                        <Text className="text-base font-bold ml-2 text-neutral-800 dark:text-neutral-300">{item.label}</Text>
                        <Text className="text-sm ml-2 text-neutral-800 dark:text-neutral-300">{item.description}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <>
              {/* 其他选项 */}
              <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-3xl mb-5">
                <View className="gap-3">
                  {otherItems.map((item, idx) => (
                    <TouchableOpacity key={idx} className="flex-row items-center pt-4 pb-4 ml-2" onPress={() => navigation.navigate(item.screen, item.params)}>
                      <MaterialIcon name={item.icon} size={22} color={isDark ? '#A9A9A9' : '#888'} />
                      <Text className="text-base ml-5 text-neutral-800 dark:text-neutral-300">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        />
      </View>
    </SafeAreaProvider>
  );
}