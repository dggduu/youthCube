import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text, Image } from 'react-native';
import FastImage from "react-native-fast-image";
const FeedElem = ({ imgUrl, title, subtitle, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="m-1 px-1"
    >
      <View className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
        {/* 图片区域 */}
        {imgUrl && (
          <FastImage
            source={{ uri: imgUrl }}
            style={{
              width: '100%',
              aspectRatio: 16 / 9,
              backgroundColor: '#e5e7eb',
            }}
            resizeMode={FastImage.resizeMode.cover}
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