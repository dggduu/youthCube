import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ErrorPlaceholder = ({ 
  message = '加载失败，请重试', 
  icon = 'error-outline', 
  iconSize = 48, 
  iconColor, 
  onPress 
}) => {
  const { colorScheme } = require('nativewind');
  const isDark = colorScheme === 'dark';

  // 默认图标颜色
  const defaultIconColor = iconColor || (isDark ? '#f87171' : '#ef4444'); // red-400

  return (
    <View className="flex-1 justify-center items-center px-4 py-8">
      {/* 图标 */}
      <Icon 
        name={icon} 
        size={iconSize} 
        color={defaultIconColor} 
      />

      {/* 文字 */}
      <Text
        className="text-base text-gray-600 dark:text-gray-300 mt-3 text-center"
        style={{ lineHeight: 22 }}
      >
        {message}
      </Text>

      {/* 可点击重试 */}
      {onPress && (
        <Pressable
          onPress={onPress}
          className="flex-row items-center mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 active:bg-blue-100 dark:active:bg-blue-800"
          android_ripple={{ color: '#bfdbfe', radius: 24 }}
        >
          <Icon name="refresh" size={16} color="#3b82f6" />
          <Text className="text-blue-600 dark:text-blue-400 text-sm font-medium ml-1.5">
            点击重试
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ErrorPlaceholder;