import { View, Text, TouchableOpacity,SafeAreaView } from 'react-native';
import React from 'react';
import PostFeed from '../../components/feedElem/postFeed';
import { useNavigation } from '@react-navigation/native';
import { navigate } from "../../navigation/NavigatorRef";
export default function LearningHomeScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white dark:bg-gray-600">
      <Text className='text-4xl mt-10 ml-4 mb-1 text-black dark:text-gray-200'
        style={{
          fontFamily:"NotoSerifSC",
        }}
      >学习中心</Text>
      <View className="flex-row justify-between px-4 py-3">
        <TouchableOpacity
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-600 flex-1 items-center p-3 mr-2'
          onPress={() => navigate('RootLearn', { screen: 'Collect', params: { screen: 'IdeaMarket' } })}
        >
          <Text className="text-base text-black dark:text-gray-300">我的收藏</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-600 flex-1 items-center p-3'
          onPress={() => navigate('RootLearn', { screen: 'Upload'})}
        >
          <Text className="text-base text-black dark:text-gray-300">发布新帖</Text>
        </TouchableOpacity>
      </View>

      <PostFeed />
    </View>
  );
}