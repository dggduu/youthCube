import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text, Image } from 'react-native';

const FeedElem = ({ imgUrl, title, subtitle, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="m-1"
    >
      <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
        {/* 图片区域 */}
        {imgUrl && (
          <Image
            source={{ uri: imgUrl }}
            className="w-full aspect-video bg-gray-200 dark:bg-gray-700"
            resizeMode="cover"
          />
        )}

        {/* 内容区域 */}
        <View className="p-3">
          <Text
            numberOfLines={2}
            className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1"
          >
            {title || '暂无标题'}
          </Text>
          <Text
            numberOfLines={2}
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            {subtitle || '暂无描述'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FeedElem;