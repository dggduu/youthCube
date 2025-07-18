import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import WaterfallFlow from 'react-native-waterfall-flow';
import FeedElem from './feedElem';
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { getItemFromAsyncStorage } from "../../utils/LocalStorage";

const CollectPostFeed = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const scrollViewRef = useRef(null);
  const accessTokenRef = useRef(null);
  const isMounted = useRef(true);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      accessTokenRef.current = await getItemFromAsyncStorage('accessToken');
      if (isMounted.current) {
        fetchData(0);
      }
    };
    init();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (pageNum) => {
    if (!accessTokenRef.current || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/collect/post?page=${pageNum}&size=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessTokenRef.current}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      const newData = result.data.map((item, index) => ({
        id: item.post_id || `${pageNum}-${index}`,
        imgUrl: item.cover_image_url,
        title: item.title,
        subtitle: item.content?.substring(0, 50) + (item.content?.length > 50 ? '...' : ''),
        height: index % 3 === 0 ? 300 : index % 2 === 0 ? 250 : 200,
      }));

      setData(prev => pageNum === 0 ? newData : [...prev, ...newData]);
      setPage(pageNum + 1);
      setHasMore(pageNum < (result.pagination?.totalPages || 1) - 1);

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [loading]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page);
    }
  }, [loading, hasMore, page, fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    fetchData(0);
  }, [fetchData]);

  const renderItem = ({ item }) => (
    <FeedElem
      imgUrl={item.imgUrl}
      title={item.title}
      subtitle={item.subtitle}
      onPress={() => navigation.navigate('PostDetail', {
        postId: item.id,
        title: item.title,
        coverImage: item.imgUrl,
      })}
    />
  );

  const renderFooter = () => (
    <View className="flex-row justify-center items-center py-4">
      {loading && <ActivityIndicator size="small" color="#3b82f6" />}
      {!hasMore && <Text className="text-gray-500 ml-2">没有更多内容了</Text>}
    </View>
  );

  const renderEmptyComponent = () => (
    <View className="flex-1 justify-center items-center mt-16">
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <Text className="text-gray-500 text-lg">暂无收藏内容</Text>
      )}
    </View>
  );

  const scrollToTop = () => {
    scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 mt-2">
      <WaterfallFlow
        ref={scrollViewRef}
        key={`waterfall-${page}`}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
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
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      />

      {scrollY > 200 && (
        <TouchableOpacity
          onPress={scrollToTop}
          className="absolute right-4 bottom-4 bg-purple-600 dark:bg-purple-900 w-12 h-12 rounded-full justify-center items-center shadow-lg"
        >
          <MaterialIcons 
            name="arrow-upward" 
            size={20} 
            color={isDark ? '#ccc' : '#fff'} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CollectPostFeed;