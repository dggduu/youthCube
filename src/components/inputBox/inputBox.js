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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-5">
      {label && (
        <Text
          className={`${
            isDark ? 'text-gray-300' : 'text-gray-700'
          } mb-3 font-normal`}
        >
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-md px-3 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        } ${isFocused ? (isDark ? 'border-blue-400' : 'border-blue-500') : isDark ? 'border-gray-600' : 'border-gray-300'
        } border`}
      >
        {leftIconName && (
          <MaterialIcon
            name={leftIconName}
            size={20}
            color={isDark ? '#A9A9A9' : '#888'}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className={`flex-1 text-base ${
            isDark ? 'text-gray-200' : 'text-gray-800'
          }`}
          style={{height:55}}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#666' : '#999'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

export default InputBox;