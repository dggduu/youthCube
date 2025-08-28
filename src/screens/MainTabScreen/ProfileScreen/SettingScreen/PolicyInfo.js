import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import BackIcon from '../../../../components/backIcon/backIcon';
import { PrivatePolicy, TeenPolicy, UserPolicy, CommunityPolicy } from "../../../../assets/agreement/Policy";

export default function PolicyInfo({ route }) {
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800';

  const getPolicyContent = (type) => {
    switch (type) {
      case 'PrivatePolicy':
        return PrivatePolicy;
      case 'TeenPolicy':
        return TeenPolicy;
      case 'UserPolicy':
        return UserPolicy;
      case 'CommunityPolicy':
        return CommunityPolicy;
      default:
        return PrivatePolicy;
    }
  };

  const { type = 'PrivatePolicy' } = route?.params || {};
  const content = getPolicyContent(type);

  const lines = content.split('\n');

  const title = lines[0]; 

  const date = lines.slice(1, 3).join('\n'); 

  const Content = lines.slice(3).join('\n'); 

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <BackIcon /> 

      <ScrollView className="flex-1 px-5 pt-2 pb-16">
        <Text className={`text-base leading-6 text-center font-bold ${textColor}`}>
          {title}
        </Text>

        <Text className={`text-base leading-6 text-center font-bold ${textColor}`}>
          {date}
        </Text>

        <Text className={`text-base leading-6 ${textColor}`}>
          {Content}
        </Text>
      </ScrollView>
    </View>
  );
}