// InputBox.js
import React, { useState } from 'react';
import { View, Text, TextInput, useColorScheme } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const InputBox = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  leftIconName = null,
  rightButton = null,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-5">
      {label && (
        <Text
          className={`mb-3 font-normal ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-lg ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } ${
          isFocused
            ? isDark
              ? 'border-2 border-blue-400'
              : 'border-2 border-blue-500'
            : isDark
            ? 'border border-gray-600'
            : 'border border-gray-300'
        }`}
      >
        {/* 左侧图标 */}
        {leftIconName && (
          <MaterialIcon
            name={leftIconName}
            size={20}
            color={isDark ? '#A9A9A9' : '#888'}
            style={{ marginLeft: 12, marginRight: 5 }}
          />
        )}

        {/* 输入框 */}
        <TextInput
          className={`flex-1 py-4 ${isDark ? 'text-gray-200' : 'text-gray-800 ml-2'}`}
          style={{ height: 55 }}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* 右侧按钮*/}
        {rightButton}
      </View>
    </View>
  );
};

export default InputBox;