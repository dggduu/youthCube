import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import { navigate } from '../../navigation/NavigatorRef';
import { getGradeLabel } from '../../utils/utils';

const styles = StyleSheet.create({
  image: {
    width: 128,
    height: 96,
  },
  tagText: {
    maxWidth: 80, // 限制标签文本最大宽度
  },
});

const TeamCard = ({ title, tags, onPress, img_url, grade }) => {
  const isDark = useColorScheme() === 'dark';

  // 截断过长的标签名称
  const truncateTagName = (name) => {
    return name.length > 10 ? `${name.substring(0, 10)}...` : name;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="my-2 mx-5"
      accessibilityLabel={`团队：${title}`}
    >
      {/* 卡片容器*/}
      <View className="flex-row bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600">
        
        {/* 左侧图片*/}
        {img_url &&
          <FastImage
            source={{ uri: img_url }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
            accessibilityLabel={`团队封面：${title}`}
          />}

        {/* 右侧内容 */}
        <View className="flex-1 p-3 justify-center">
          {/* 标题 */}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1"
          >
            {title}
          </Text>

          {/* 标签行 */}
          <View className="flex-row flex-wrap items-center mb-1">
            {tags?.slice(0, 3).map((tag) => (
              <TouchableOpacity
                key={tag.tag_id}
                onPress={() =>
                  navigate('RootIdea', {
                    screen: 'Tag',
                    params: { tagId: tag.tag_id },
                  })
                }
                className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mr-1 mb-1 border border-blue-100 dark:border-blue-800"
              >
                <Text 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.tagText}
                  className="text-blue-600 dark:text-blue-300 text-xs font-medium"
                >
                  {truncateTagName(tag.tag_name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 推荐年龄 */}
          {grade && (
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              推荐年龄：{getGradeLabel(grade)}
            </Text>
          )}
        </View>

        {/* 右侧箭头 */}
        <View className="justify-center px-4">
          <Icon
            name="arrow-forward-ios"
            size={16}
            color={isDark ? '#fff' : '#000'}
            style={{ opacity: 0.7 }}
            accessibilityLabel="进入团队"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TeamCard;