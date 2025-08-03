// CustomPicker.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// 启用 LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CustomPicker = ({
  label = '选择',
  options = [],
  selectedValue,
  onValueChange,
  placeholder = '请选择',
  key: componentKey,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel =
    options.find((item) => item.value === selectedValue)?.label || placeholder;

  const buttonRef = useRef(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0 });

  const onButtonLayout = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setButtonPosition({ x: pageX, y: pageY + height, width });
    });
  };

  return (
    <>
      {/* 输入框区域 */}
      <Pressable
        key={componentKey}
        className="mb-4"
        onPress={() => {
          onButtonLayout();
          setModalVisible(true);
        }}
        ref={buttonRef}
        onLayout={onButtonLayout}
      >
        {/* Label */}
        <Text
          className={`mb-2 ml-1 font-normal ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {label}
        </Text>

        {/* 选择器输入框 */}
        <View
          className={`flex-row items-center justify-between px-4 py-3 rounded-lg border h-[55] ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          }`}
        >
          <Text
            className={`flex-1 ${selectedValue ? (isDark ? 'text-white' : 'text-gray-800') : (isDark ? 'text-gray-400' : 'text-gray-500')}`}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>
          <MaterialIcons
            name="arrow-drop-down"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
        </View>
      </Pressable>

      {/* Modal*/}
      <Modal
        animationType="none"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        supportedOrientations={['portrait', 'landscape']}
      >
        <Pressable
          className="flex-1"
          onPress={() => setModalVisible(false)}
        >
          <Animated.View
            entering={FadeInDown.duration(200)}
            exiting={FadeOutUp.duration(150)}
            className={`absolute rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
            style={{
              top: buttonPosition.y - 40,
              left: buttonPosition.x,
              width: buttonPosition.width,
              maxHeight: 200,
              elevation: 10,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              nestedScrollEnabled
            >
              {options.map((item) => {
                const isSelected = selectedValue === item.value;
                return (
                  <Pressable
                    key={item.value}
                    className={`flex-row items-center px-4 py-3 ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-900/50'
                          : 'bg-blue-50'
                        : ''
                    }`}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      className={`flex-1 ${
                        isSelected
                          ? 'text-[#409eff]'
                          : isDark
                          ? 'text-gray-100'
                          : 'text-gray-800'
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialIcons
                        name="check"
                        size={18}
                        color="#3B82F6"
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

export default CustomPicker;