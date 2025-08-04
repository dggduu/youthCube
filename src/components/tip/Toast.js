import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';
// 自定义Toast的类型和颜色
const TOAST_TYPES = {
  success: {
    icon: 'check-circle',
    colorLight: 'bg-[#4c662b]',
    colorDark: 'bg-[#4c662b]',
  },
  error: {
    icon: 'error',
    colorLight: 'bg-[#98000a]',
    colorDark: 'bg-[#98000a]',
  },
  warning: {
    icon: 'warning',
    colorLight: 'bg-yellow-500',
    colorDark: 'bg-yellow-700',
  },
  info: {
    icon: 'info',
    colorLight: 'bg-blue-500',
    colorDark: 'bg-blue-700',
  },
};

const DURATION = 1000; // 显示时长
const ANIMATION_DURATION = 200; // 淡入淡出动画时长

const Toast = ({ message, type = 'info', onHide }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50); // 从上方滑入
  const { colorScheme } = useColorScheme();

    //默认样式配置
  const toastConfig = TOAST_TYPES[type] || {
    icon: type,
    colorLight: 'bg-gray-700',
    colorDark: 'bg-gray-900',
  };

  const backgroundColorClass = colorScheme === 'dark' ? toastConfig.colorDark : toastConfig.colorLight;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: ANIMATION_DURATION }),
      withTiming(1, { duration: DURATION - ANIMATION_DURATION * 2 }),
      withTiming(0, { duration: ANIMATION_DURATION }, (finished) => {
        if (finished) {
          runOnJS(onHide)();
        }
      })
    );

    translateY.value = withSequence(
      withTiming(0, { duration: ANIMATION_DURATION }),
      withTiming(0, { duration: DURATION - ANIMATION_DURATION * 2 }),
      withTiming(-50, { duration: ANIMATION_DURATION })
    );

  }, [message, type, onHide]);

  return (
      <Animated.View
        className={`absolute top-20 self-center p-3 rounded-xl shadow-lg flex-row items-center z-50 ${backgroundColorClass}`}
        style={animatedStyle}
      >
        {toastConfig.icon && (
          <MaterialIcons
            name={toastConfig.icon}
            size={24}
            color="white"
            className="mr-2"
          />
        )}
        <Text className="text-white text-base font-semibold max-w-[80vw]">
          {message}
        </Text>
      </Animated.View>

  );
};

export default Toast;