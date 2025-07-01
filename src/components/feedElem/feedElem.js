import React from 'react';
import { View, Text, Image, useWindowDimensions, TouchableOpacity } from 'react-native';

const FeedElem = ({ imgUrl, title, subtitle, onPress }) => {
  const { width } = useWindowDimensions();

  const imageWidth = 180;
  const imageHeight = imageWidth / 3 *4;// 4:3 比例

  return (
    <TouchableOpacity onPress={onPress}>
        <View
        className="bg-white dark:bg-gray-800 rounded-lg m-2 shadow-md overflow-hidden"
        style={{ width: imageWidth + 8 }}
        >
        {imgUrl ? (
            <Image
            source={require("../../assets/logo/ava.png")}
            className="w-full rounded-t-lg"
            style={{ height: imageHeight, resizeMode: 'cover' }}
            />
        ) : (
            <View
            className="w-full bg-gray-200 dark:bg-gray-700 justify-center items-center rounded-t-lg"
            style={{ height: imageHeight }}
            >
            <Text className="text-gray-500 dark:text-gray-400 font-bold text-base">
                No Image
            </Text>
            </View>
        )}
        <View className="p-2">
            <Text
            className="text-gray-900 dark:text-white font-bold text-lg mb-1"
            numberOfLines={2}
            >
            {title || '暂无标题'}
            </Text>
            <Text
            className="text-gray-600 dark:text-gray-300 text-bases"
            numberOfLines={1}
            >
            {subtitle || '暂无描述'}
            </Text>
        </View>
        </View>
    </TouchableOpacity>

  );
};

export default FeedElem;