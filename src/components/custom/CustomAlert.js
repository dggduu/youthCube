import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';


const CustomAlert = ({
  visible,
  title,
  message,
  buttons,
  onClose,
}) => {
  const { colorScheme } = useColorScheme();
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 50 });
    } else {
      opacity.value = withTiming(0, { duration: 50 });
    }
  }, [visible, opacity]);

  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedDialogStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(visible ? 1 : 0.9, { duration: 100 }) },
      ],
    };
  });

  const isDark = colorScheme === 'dark';

  // 默认按钮
  const renderButton = (button, index) => {
    let bgColor = 'bg-gray-100 dark:bg-gray-700';
    let textColor = 'text-gray-800 dark:text-gray-200';
    let fontWeight = 'font-normal';

    if (button.style === 'cancel') {
      bgColor = 'bg-gray-100 dark:bg-gray-700';
      textColor = 'text-gray-600 dark:text-gray-300';
    } else if (button.style === 'destructive') {
      bgColor = 'bg-red-500';
      textColor = 'text-white';
      fontWeight = 'font-semibold';
    } else {
      bgColor = 'bg-blue-500';
      textColor = 'text-white';
      fontWeight = 'font-semibold';
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          button.onPress?.();
          onClose();
        }}
        activeOpacity={0.7}
        className={`${bgColor} px-4 py-2 rounded-lg min-w-[80px] items-center ${index === 0 ? 'mr-2' : ''}`}
      >
        <Text className={`${textColor} ${fontWeight} text-base`}>{button.text}</Text>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <Animated.View
        style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, animatedOverlayStyle]}
      >
        {/* 遮罩层 */}
        <Pressable
          className="absolute inset-0 bg-black/40 dark:bg-black/60"
          onPress={onClose}
        />

        {/* 弹窗 */}
        <Animated.View
          style={[animatedDialogStyle]}
          className="relative w-11/12 max-w-sm mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* 图标*/}
          <View className="flex-row items-center px-5 pt-5 pb-2">
            <MaterialIcons
              name="error-outline"
              size={28}
              color={isDark ? '#fbbf24' : '#f59e0b'}
            />
            <Text
              className="ml-2 text-xl font-semibold text-gray-800 dark:text-gray-100"
              style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'normal' }}
            >
              {title}
            </Text>
          </View>

          {/* 内容 */}
          {message ? (
            <Text
              className="px-5 pb-4 text-base text-gray-600 dark:text-gray-300 leading-relaxed"
              style={{ lineHeight: 22 }}
            >
              {message}
            </Text>
          ) : null}

          {/* 按钮组 */}
          <View className="flex-row px-5 pb-4 pt-2 justify-end">
            {buttons.map((btn, idx) =>
              renderButton(
                {
                  ...btn,
                  onPress: btn.onPress || (() => {}),
                },
                idx
              )
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CustomAlert;