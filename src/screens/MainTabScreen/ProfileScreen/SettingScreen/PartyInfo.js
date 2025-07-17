import React from 'react';
import { ScrollView, Text, View, Image } from 'react-native';
import { useColorScheme } from 'nativewind';
import BackIcon from '../../../../components/backIcon/backIcon'; 
import { BASE_INFO } from '../../../../constant/base';

export default function PartyInfo() {
  const { colorScheme } = useColorScheme();

  const textColor = colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const subTextColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const headerTextColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <BackIcon />

      <View className="flex-1 px-6 pt-4 pb-10">
        <Image
          source={require('../../../../assets/logo/ava.png')}
          className="h-24 w-24 rounded-full mt-6 mb-4 self-center shadow-lg" 
          resizeMode="contain"
        />

        <Text className={`text-4xl font-extrabold text-center mb-2 ${headerTextColor}`}>
          青智立方
        </Text>
        <Text className={`text-base text-center mb-8 ${subTextColor}`}>
          青少年多维成长 AI 赋能平台
        </Text>

        <Text className={`text-xl font-bold mt-6 mb-3 ${headerTextColor}`}>
          应用版本
        </Text>
        <Text className={`text-base leading-6 mb-2 ${textColor}`}>
          <Text className="font-semibold">版本号：</Text>{BASE_INFO.Version}
        </Text>
        <Text className={`text-base leading-6 mb-2 ${textColor}`}>
          <Text className="font-semibold">构建号：</Text>{BASE_INFO.Release}
        </Text>
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          <Text className="font-semibold">最近更新：</Text>{BASE_INFO.LastUpdate}
        </Text>
        <Text className={`text-sm text-center ${subTextColor}`}>
          感谢您的支持！
        </Text>
      </View>
    </ScrollView>
  );
}