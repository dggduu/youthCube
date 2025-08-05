// SelectExample.js
import React, { useState } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import Carousel from 'react-native-reanimated-carousel';
import { example } from '../../../assets/ProgressExmaple/ProgressEmaple';
import { useNavigation } from '@react-navigation/native';
import { useSharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';

const { width: viewportWidth } = Dimensions.get('window');

const SelectEample = () => {
  const navigation = useNavigation();
  const progressValue = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { colorScheme } = useColorScheme(); // 获取当前主题：light / dark

  // 更新状态需通过 runOnJS
  const updateIndex = (index) => {
    setActiveIndex(index);
  };

  useAnimatedReaction(
    () => progressValue.value,
    (current) => {
      const index = Math.round(current);
      if (index !== activeIndex) {
        runOnJS(updateIndex)(index);
      }
    }
  );

  // 渲染每张卡片
  const renderItem = ({ item, index }) => {
    // 根据主题选择卡片背景色
    const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-800';
    const descColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';

    return (
      <Pressable
        key={index}
        onPress={() => navigation.navigate('UploadExmaple', { index: index })}
        className={`${cardBg} border rounded-xl p-5 justify-between flex-1 border-gray-300 dark:border-gray-600`}
      >
        {/* 图片 */}
        <FastImage
          source={item.img}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* 文字内容 */}
        <View className="mt-5 mb-2">
          <Text className={`text-4xl font-bold ${textColor}`} numberOfLines={2}>
            {item.title}
          </Text>
          <Text className={`mt-3 ${descColor}`} numberOfLines={7}>
            {item.description}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">

      <View className="flex-1 justify-center items-center px-2">
        {/* 轮播 */}
        <Carousel
          loop
          width={viewportWidth - 50}
          height={600}
          data={example}
          renderItem={renderItem}
          autoPlay={true}
          autoPlayInterval={2500}
          mode="horizontal-stack"
          modeConfig={{
            snapDirection: 'left',
            stackInterval: 18,
            visibleItemsScaleFactor: 0.9,
          }}
          scrollAnimationDuration={1000}
          onProgressChange={progressValue}
          panGestureHandlerProps={{
            activeOffsetX: [-10, 10],
          }}
        />

        {/* 分页指示器 */}
        <View style={styles.paginationContainer}>
          {example.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex % example.length ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#409eff',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },
});

export default SelectEample;