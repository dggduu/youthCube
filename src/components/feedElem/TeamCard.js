import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";
const TeamCard = ({ title, tags, onPress }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View className="mx-4 my-2 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-200 dark:border-gray-700 flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-bold text-gray-800 dark:text-white">{title}</Text>
          <View className="flex-row flex-wrap mt-2">
            {tags.slice(0, 4).map((tag) => (
              <TouchableOpacity
                onPress={()=>{
                  navigation.navigate("Tag", {
                    tagId: tag.tag_id,
                  });
                }}
                key={tag.tag_id}
                className="bg-indigo-100 dark:bg-indigo-700 px-3 py-1 rounded-full mr-2">
                <Text className="text-sm text-indigo-800 dark:text-gray-100 font-medium">{tag.tag_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* 添加的箭头图标 */}
        <Icon name="arrow-forward-ios" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
};

export default TeamCard;