import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Image } from 'react-native';
import { useColorScheme } from 'nativewind';
import BackIcon from '../../../../components/backIcon/backIcon';
import DeviceInfo from 'react-native-device-info';

export default function PartyInfo() {
  const { colorScheme } = useColorScheme();
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const textColor = colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const subTextColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const headerTextColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
  const currentVersion = DeviceInfo.getVersion();
  const currentBuildNumber = DeviceInfo.getBuildNumber();

  useEffect(() => {
    const fetchLastUpdateTime = async () => {
      try {
        const timestamp = await DeviceInfo.getLastUpdateTime();
        setLastUpdateTime(timestamp);
      } catch (error) {
        console.error('获取更新时间失败:', error);
        setLastUpdateTime(null);
      }
    };

    fetchLastUpdateTime();
  }, []);

  const formattedDate = lastUpdateTime
    ? new Date(lastUpdateTime).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : '未知';

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
          <Text className="font-semibold">版本号：</Text>
          {currentVersion}
        </Text>
        <Text className={`text-base leading-6 mb-2 ${textColor}`}>
          <Text className="font-semibold">构建号：</Text>
          {currentBuildNumber}
        </Text>
        <Text className={`text-base leading-6 mb-4 ${textColor}`}>
          <Text className="font-semibold">最近更新：</Text>
          {formattedDate}
        </Text>

        <Text className={`text-sm text-center ${subTextColor}`}>
          感谢您的支持！
        </Text>
      </View>
    </ScrollView>
  );
}