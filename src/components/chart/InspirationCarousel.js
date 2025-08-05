import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import setupAuthInterceptors from '../../utils/axios/AuthInterceptors';
import { BASE_INFO } from '../../constant/base';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const api = axios.create();
setupAuthInterceptors(api);

const { width: screenWidth } = Dimensions.get('window');

const PAGE_SIZE = 20;
const ITEMS_PER_PAGE = 2;
const AUTO_SWITCH_INTERVAL = 5000;

const fetchThoughtBullets = async (page = 0) => {
  const response = await api.get(`${BASE_INFO.BASE_URL}api/thoughbullet`, {
    params: {
      page,
      size: PAGE_SIZE,
    },
  });
  return response.data;
};

const InspirationCarousel = ({ onMenuPress, onItemPress }) => {
  const [page, setPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayItems, setDisplayItems] = useState([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['thoughtBullets', page],
    queryFn: () => fetchThoughtBullets(page),
    keepPreviousData: true,
  });
  const width = Dimensions.get('window').width;
  const containerWidth = (width / 2) - 20;
  const containerHeight = (containerWidth / 3) * 4;
  // 初始化显示数据
  useEffect(() => {
    if (data?.items?.length > 0) {
      const initialItems = data.items.slice(0, ITEMS_PER_PAGE);
      setDisplayItems(initialItems);
    }
  }, [data]);

  // 自动切换逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      if (!data?.items) return;

      const nextIndex = currentIndex + ITEMS_PER_PAGE;

      if (nextIndex >= data.items.length && data.totalPages > page + 1) {
        setPage((prev) => prev + 1);
        setCurrentIndex(0);
      }
      else if (nextIndex + ITEMS_PER_PAGE <= data.items.length) {
        setCurrentIndex(nextIndex);
        setDisplayItems(data.items.slice(nextIndex, nextIndex + ITEMS_PER_PAGE));
      }
      else {
        setCurrentIndex(0);
        setDisplayItems(data.items.slice(0, ITEMS_PER_PAGE));
      }
    }, AUTO_SWITCH_INTERVAL);

    return () => clearInterval(timer);
  }, [currentIndex, data, page]);

  if (isLoading && displayItems.length === 0) {
    return (
      <View className="w-1/2 bg-white dark:bg-gray-800 rounded-2xl p-4 mb-2">
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
          实时灵感
        </Text>
        <View className="h-38 justify-center items-center">
          <Text className="text-gray-500 dark:text-gray-400">加载中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="w-1/2 bg-white dark:bg-gray-800 rounded-2xl p-4 mb-2">
        <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
          实时灵感
        </Text>
        <View className="h-38 justify-center items-center">
          <Text className="text-red-500 dark:text-red-400">加载失败: {error.message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]} className='bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title} className='text-black dark:text-gray-300'>实时灵感</Text>
        <TouchableOpacity onPress={onMenuPress}>
          <MaterialIcons name='upload' size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
        
      {/* 弹幕内容区 */}
      <View style={styles.contentContainer}>
        {displayItems.map((item, index) => (
          <Animated.View
            key={`${item.id}-${index}`}
            entering={FadeIn.duration(800)}
            exiting={FadeOut.duration(800)}
            style={styles.itemContainer}
          >
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => onItemPress(item.author?.id)}
            >
              <View style={styles.messageContainer} className='bg-gray-50 dark:bg-gray-600'>
                <Text
                  style={styles.messageText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  className='text-black dark:text-gray-300'
                >
                  {item.message}
                </Text>
                <Text style={styles.authorText} className='text-black dark:text-gray-300'>
                  - {item.author?.name || '匿名用户'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  itemContainer: {
    marginBottom: 10,
  },
  messageContainer: {
    borderRadius: 6,
    padding: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 12,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});

export default InspirationCarousel;