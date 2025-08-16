import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import setupAuthInterceptors from '../../utils/axios/AuthInterceptors';
import { BASE_INFO } from '../../constant/base';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { navigate } from "../../navigation/NavigatorRef";
import { formatTimeToChinese } from "../../utils/utils";

const api = axios.create();
setupAuthInterceptors(api);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

const InspirationCarousel = ({ onMenuPress }) => {
  const [page, setPage] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayItems, setDisplayItems] = useState([]);
  const [selectedMoral, setSelectedMoral] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['thoughtBullets', page],
    queryFn: () => fetchThoughtBullets(page),
    keepPreviousData: true,
  });

  // Calculate dimensions based on screen aspect ratio
  const isSquareScreen = screenWidth / screenHeight > 0.9 && screenWidth / screenHeight < 1.1;
  const containerWidth = isSquareScreen ? screenWidth * 0.45 : (screenWidth / 2) - 25;
  const containerHeight = containerWidth; // Make it square
  const itemHeight = (containerHeight - 60) / ITEMS_PER_PAGE; // Subtract header height and divide by items count

  useEffect(() => {
    if (data?.items?.length > 0) {
      const initialItems = data.items.slice(0, ITEMS_PER_PAGE);
      setDisplayItems(initialItems);
    }
  }, [data]);

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

  const handleLongPress = (item) => {
    setSelectedMoral(item);
    setModalVisible(true);
  };

  const handlePress = (userId, userName) => {
    navigate('RootIdea', { screen: 'profile', params: { user_id: userId, user_name: userName } });
  };

  if (isLoading && displayItems.length === 0) {
    return (
      <View style={[styles.container, { width: containerWidth, height: containerHeight }]} 
        className="bg-white dark:bg-gray-800 rounded-2xl">
        <Text style={styles.title} className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
          实时灵感
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">加载中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { width: containerWidth, height: containerHeight }]} 
        className="bg-white dark:bg-gray-800 rounded-2xl">
        <Text style={styles.title} className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
          实时灵感
        </Text>
        <View style={styles.loadingContainer}>
          <Text className="text-[#f56c6c] dark:text-red-400">加载失败,请检查网络</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: containerWidth, height: containerHeight }]} 
      className='bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} className='text-black dark:text-gray-300'>实时灵感</Text>
        <TouchableOpacity onPress={onMenuPress}>
          <MaterialIcons name='upload' size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
        
      {/* Content area */}
      <View style={styles.contentContainer}>
        {displayItems.map((item) => (
          <Animated.View
            key={item.id}
            entering={FadeIn.duration(800)}
            exiting={FadeOut.duration(800)}
            style={[styles.itemContainer, { height: itemHeight }]}
          >
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => handlePress(item.author?.id, item.author?.name)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={300}
              style={styles.touchableContainer}
            >
              <View style={styles.messageContainer} className='bg-gray-50 dark:bg-gray-600'>
                <Text
                  style={styles.messageText}
                  numberOfLines={isSquareScreen ? 3 : 2}
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

      {/* Moral Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent} className='bg-white dark:bg-gray-700'>
            <Text style={styles.modalTitle} className='text-black dark:text-gray-300'>灵感详情</Text>
            <View className='mb-1 border-b border-gray-200 pb-2 dark:border-gray-400'>
              <Text 
                numberOfLines={1}
                ellipsizeMode="tail"
                className='text-black dark:text-gray-300'
              >
                发布者：{selectedMoral?.author?.name}
              </Text>
              <Text className='mt-1 text-black dark:text-gray-300'>更新时间：{formatTimeToChinese(selectedMoral?.updated_at)}</Text>
            </View>
            <ScrollView className='h-96 mb-2'>
              <Text style={styles.modalText} className='text-black dark:text-gray-200'>
                {selectedMoral?.message}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemContainer: {
    marginBottom: 8,
    flex: 1,
  },
  touchableContainer: {
    flex: 1,
  },
  messageContainer: {
    borderRadius: 8,
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
    flexShrink: 1,
  },
  authorText: {
    fontSize: 12,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default InspirationCarousel;