import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  useColorScheme
} from 'react-native';
import FeedElem from '../../components/feedElem/feedElem';
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { navigate } from "../../navigation/NavigatorRef";
import axios from 'axios';
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";

const api = axios.create();
setupAuthInterceptors(api);

const LearningHomeScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const lastRequestTime = useRef(0);
  const requestInProgress = useRef(false);
  const flatListRef = useRef(null);

  const colorScheme = useColorScheme();
  const IsDark = colorScheme === 'dark';
  const navigation = useNavigation();

  const fetchData = useCallback(
    async (pageNum) => {
      if (
        requestInProgress.current ||
        loadingRef.current ||
        (!hasMoreRef.current && pageNum > 0)
      ) {
        return;
      }

      const now = Date.now();
      const timeSinceLast = now - lastRequestTime.current;
      if (timeSinceLast < 500) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 - timeSinceLast)
        );
      }

      requestInProgress.current = true;
      loadingRef.current = true;
      setLoading(true);
      lastRequestTime.current = Date.now();

      try {
        const url = `${BASE_INFO.BASE_URL}api/posts?page=${pageNum}&size=15`;
        const response = await api.get(url);
        const result = response.data;

        const newData = result.items.map((item, index) => ({
          id: item.post_id,
          imgUrl: item.cover_image_url,
          title: item.title,
          subtitle:
            item.content.length > 50
              ? item.content.substring(0, 50) + '...'
              : item.content,
          height: index % 3 === 0 ? 300 : index % 2 === 0 ? 250 : 200,
        }));

        setTotalPages(result.totalPages);

        if (pageNum >= result.totalPages - 1) {
          hasMoreRef.current = false;
          setHasMore(false);
        }

        if (pageNum === 0) {
          setData(newData);
        } else {
          setData((prev) => [...prev, ...newData]);
        }

        pageRef.current = pageNum + 1;
        setPage(pageNum + 1);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        requestInProgress.current = false;
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(0);
  }, [fetchData]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMoreRef.current) {
      fetchData(pageRef.current);
    }
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    setPage(0);
    hasMoreRef.current = true;
    setHasMore(true);
    setData([]);
    fetchData(0);
  }, [fetchData]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="flex-row justify-center items-center py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-gray-500 ml-2">加载中...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View className="flex-1 justify-center items-center mt-16">
        <Text className="text-gray-500 text-lg">暂无内容</Text>
      </View>
    );
  };

  const onFeedElemPress = (item) => {
    navigate('RootLearn', { 
      screen: 'Post', 
      params: { 
        screen: "PostDetail", 
        params: {
          postId: item.id,
          title: item.title,
          coverImage: item.imgUrl,
        } 
      } 
    });
  };

  const scrollToTop = () => {
    if (flatListRef.current?.scrollToOffset) {
      flatListRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
  };

  const renderHeader = () => (
    <View className='bg-white dark:bg-gray-800'>
      <Text 
        className='text-4xl mt-10 ml-4 mb-1 text-black dark:text-gray-200'
        style={{ fontFamily: "NotoSerifSC" }}
      >
        学习中心
      </Text>
      <View className="flex-row justify-between px-4 py-3">
        <TouchableOpacity
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-600 flex-1 items-center p-3 mr-2'
          onPress={() => navigate('RootLearn', { screen: 'Collect', params: { screen: 'IdeaMarket' } })}
        >
          <Text className="text-base text-black dark:text-gray-300">我的收藏</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-600 flex-1 items-center p-3'
          onPress={() => navigate('RootLearn', { screen: 'Upload'})}
        >
          <Text className="text-base text-black dark:text-gray-300">发布新帖</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={{ flex: 1, padding: 5 }}>
      <FeedElem
        imgUrl={item.imgUrl}
        title={item.title}
        subtitle={item.subtitle}
        onPress={() => onFeedElemPress(item)}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {scrollY > 200 && (
        <TouchableOpacity
          onPress={scrollToTop}
          className="absolute right-4 bottom-10 bg-[#409eff] dark:bg-blue-700 rounded-full flex items-center justify-center p-3"
        >
          <MaterialIcons name='arrow-upward' size={20} color={IsDark ? '#ccc' : '#fff'} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default LearningHomeScreen;