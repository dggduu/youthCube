// CustomInputAlert.js
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Platform,
  ScrollView
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GRADES } from '../../constant/user';

const CustomInputAlert = ({ visible, title, message, placeholder, onClose, onConfirm, type, initialValue, options }) => {
  const { colorScheme } = useColorScheme();
  const [inputValue, setInputValue] = useState(initialValue || '');
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 50 });
      setInputValue(initialValue || '');
    } else {
      opacity.value = withTiming(0, { duration: 50 });
    }
  }, [visible, initialValue]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedDialogStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(visible ? 1 : 0.9, { duration: 50 }) }],
  }));

  const handleConfirm = () => {
    onConfirm?.(inputValue);
    onClose();
  };

  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  const renderContent = () => {
    switch (type) {
      case 'is_public':
        return (
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={() => setInputValue(1)}
            >
              <Icon
                name={inputValue === 1 ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color={inputValue === 1 ? (isDark ? '#3B82F6' : '#2563EB') : '#9CA3AF'}
              />
              <Text className="ml-2 text-gray-900 dark:text-gray-100">公开</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={() => setInputValue(0)}
            >
              <Icon
                name={inputValue === 0 ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24}
                color={inputValue === 0 ? (isDark ? '#3B82F6' : '#2563EB') : '#9CA3AF'}
              />
              <Text className="ml-2 text-gray-900 dark:text-gray-100">私有</Text>
            </TouchableOpacity>
          </View>
        );
      case 'grade':
        return (
          <View className="mb-4 max-h-60">
            <ScrollView nestedScrollEnabled={true}>
              {GRADES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center p-3"
                  onPress={() => setInputValue(item.value)}
                >
                  <Icon
                    name={inputValue === item.value ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={24}
                    color={inputValue === item.value ? (isDark ? '#3B82F6' : '#2563EB') : '#9CA3AF'}
                  />
                  <Text className="ml-2 text-gray-900 dark:text-gray-100">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
      case 'text':
      default:
        return (
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder || '请输入内容'}
            placeholderTextColor={isDark ? '#9CA3AF' : '#999'}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base text-gray-800 dark:text-gray-100"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
            style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'normal' }}
          />
        );
    }
  };

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View
        style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, animatedOverlayStyle]}
      >
        <Pressable
          className="absolute inset-0 bg-black/40 dark:bg-black/60"
          onPress={onClose}
        />
        <Animated.View
          style={[animatedDialogStyle]}
          className="w-11/12 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <View className="px-5 pt-5 pb-2">
            <Text
              className="text-xl font-semibold text-gray-800 dark:text-gray-100"
              style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'normal' }}
            >
              {title}
            </Text>
            {message ? (
              <Text className="px-5 text-base text-gray-600 dark:text-gray-300 mt-1">
                {message}
              </Text>
            ) : null}
          </View>

          <View className="px-5 py-4">
            {renderContent()}
          </View>

          <View className="flex-row px-5 pb-4 pt-2 justify-end">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg min-w-[80px] items-center mr-2"
            >
              <Text className="text-gray-600 dark:text-gray-300 font-normal text-base">取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-blue-500 px-4 py-2 rounded-lg min-w-[80px] items-center"
            >
              <Text className="text-white font-semibold text-base">确定</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CustomInputAlert;