import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigate } from '../../navigation/NavigatorRef';

const TeamCard = ({ title, tags, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View className="mx-4 my-2 bg-white dark:bg-gray-600 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 flex-row items-center">
        <View className="flex-1 mr-2">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="text-xl font-bold text-gray-800 dark:text-white"
            style={{ overflow: 'hidden' }}出
          >
            {title}
          </Text>
          <View className="flex-row flex-wrap mt-2">
            {tags.slice(0, 4).map((tag) => (
              <TouchableOpacity
                key={tag.tag_id}
                onPress={() =>
                  navigate('RootIdea', {
                    screen: 'Tag',
                    params: { tagId: tag.tag_id },
                  })
                }
                className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full mr-2 mb-2 border border-blue-100 dark:border-blue-800 flex-row items-center"
              >
                <Text className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                  {tag.tag_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 右侧箭头图标 */}
        <Icon name="arrow-forward-ios" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
};

export default TeamCard;
