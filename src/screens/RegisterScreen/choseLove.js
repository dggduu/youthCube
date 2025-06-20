import React, { use, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Alert,
  useColorScheme
} from 'react-native';

import PreferenceBubbleSelector from '../../components/peferenceBubbleSelector/preferenceBubbleSelector';

export default function ChoseLove({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const preferenceOptions = [
    '运动',
    '音乐',
    '阅读',
    '电影',
    '游戏',
    '旅游',
    '美食',
    '科技',
    '时尚',
    '摄影',
    '编程',
    '绘画',
  ];

  const handleSubmit = (selected) => {
    if (selected.length === 0) {
      Alert.alert('提示', '请至少选择一个兴趣爱好');
      return;
    }

    setSelectedPreferences(selected);
    Alert.alert('提交成功', `你选择了：${selected.join(', ')}`);

    navigation.navigate('MainTabNavigator');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-black" : "bg-white"} px-5 pt-10`}>
      {/* 标题 */}
      <Text className={`text-xl font-bold text-center mt-16 ${isDark ? "text-gray-300" : "text-black"}`}>
        请选择你的兴趣爱好
      </Text>

      {/* 偏好选择器 */}
      <PreferenceBubbleSelector
        options={preferenceOptions}
        onSubmit={handleSubmit}
      />

      {/* 已选结果显示 */}
      {selectedPreferences.length > 0 && (
        <View className="mt-10 p-4 bg-gray-100 rounded-lg">
          <Text className="text-base text-gray-700">
            已选兴趣: {selectedPreferences.join(', ')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}