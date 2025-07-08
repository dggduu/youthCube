import React, { useState, useEffect, useCallback, useRef, use } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  useColorScheme
} from 'react-native';
import WaterfallFlow from 'react-native-waterfall-flow';
import FeedElem from './feedElem';
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import MatrialIcons from "@react-native-vector-icons/material-icons";

const CollectPostFeed = () => {
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
  const scrollViewRef = useRef(null);

  const colorScheme = useColorScheme();
  const IsDark = colorScheme ===  'dark';
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

      // 请求间隔控制
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
        const url = `${BASE_INFO.BASE_URL}api/posts?page=${pageNum}&size=10`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        const result = await response.json();

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
    navigation.navigate('PostDetail', {
      postId: item.id,
      title: item.title,
      coverImage: item.imgUrl,
    });
  };

  const scrollToTop = () => {
    if (scrollViewRef.current?.scrollToOffset) {
      scrollViewRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <WaterfallFlow
        ref={scrollViewRef}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FeedElem
            imgUrl={item.imgUrl}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => onFeedElemPress(item)}
          />
        )}
        numColumns={2}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
        contentContainerStyle="pb-20"
        itemHeight={(item) => item.height}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* 返回顶部按钮 */}
      {scrollY > 200 && (
        <TouchableOpacity
          onPress={scrollToTop}
          className="absolute right-4 bottom-4 bg-purple-600 dark:bg-purple-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:bg-blue-700"
        >
          <MatrialIcons name='arrow-upward' size={20} color={`${IsDark ? '#ccc' : '#fff'}`}/>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CollectPostFeed;