import React, { use, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  useColorScheme
} from 'react-native';

import PreferenceBubbleSelector from '../../components/peferenceBubbleSelector/preferenceBubbleSelector';
import { useToast } from "../../components/tip/ToastHooks";
export default function ChoseLove({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const { showToast } = useToast();
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
      showToast('请至少选择一个兴趣爱好', 'error');
      return;
    }

    setSelectedPreferences(selected);
    showToast(`提交成功！\n你选择了：${selected.join(', ')}`, 'success');
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
        <View className="mt-10 p-4 bg-gray-50 rounded-lg">
          <Text className="text-base text-gray-700">
            已选兴趣: {selectedPreferences.join(', ')}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}