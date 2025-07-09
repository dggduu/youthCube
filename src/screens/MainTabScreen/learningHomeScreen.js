import { View, Text, TouchableOpacity,SafeAreaView } from 'react-native';
import React from 'react';
import PostFeed from '../../components/feedElem/postFeed';
import { useNavigation } from '@react-navigation/native';

export default function LearningHomeScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white dark:bg-gray-600">
      <SafeAreaView />
      <View className="flex-row justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800">
        <TouchableOpacity
          className="flex-1 p-3 bg-white dark:bg-black rounded-lg mr-2 items-center"
          onPress={() => navigation.navigate('Collect')}
        >
          <Text className="text-base text-black dark:text-gray-300">我的收藏</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 p-3 bg-white dark:bg-black rounded-lg ml-2 items-center"
          onPress={() => navigation.navigate('Upload')}
        >
          <Text className="text-base text-black dark:text-gray-300">发布新帖</Text>
        </TouchableOpacity>
      </View>

      <PostFeed />
    </View>
  );
}