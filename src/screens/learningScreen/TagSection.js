import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Image
} from 'react-native';
import WaterfallFlow from 'react-native-waterfall-flow';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import Icon from 'react-native-vector-icons/MaterialIcons';

import axios from 'axios'
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const TagSection = () => {
  const route = useRoute();
  const { id } = route.params;
  const [tag, setTag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();

  const fetchTag = useCallback(async () => {
    try {
      const response = await api.get(`${BASE_INFO.BASE_URL}api/tags/${id}`);
      const data = response.data;
      setTag(data);
    } catch (error) {
      console.error('Error fetching tag:', error);
    }
  }, [id]);

  const fetchPosts = useCallback(async (pageNum = 0) => {
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
      await new Promise((resolve) => setTimeout(resolve, 500 - timeSinceLast));
    }

    requestInProgress.current = true;
    loadingRef.current = true;
    setLoading(true);
    lastRequestTime.current = Date.now();

    try {
      const url = `${BASE_INFO.BASE_URL}api/tags/${id}/posts?page=${pageNum}&size=10`;
      const response = await api.get(url);
      const result = response.data;

      const formattedPosts = result.items.map((item) => ({
        id: item.post_id,
        imgUrl: item.cover_image_url,
        title: item.title,
        subtitle: item.content.length > 50 
          ? item.content.substring(0, 50) + '...' 
          : item.content,
        height: Math.random() > 0.5 ? 250 : 200,
        views: item.views_count,
        likes: item.likes_count,
        comments: item.comments_count
      }));

      setTotalPages(result.totalPages);

      if (pageNum >= result.totalPages - 1) {
        hasMoreRef.current = false;
        setHasMore(false);
      }

      if (pageNum === 0) {
        setPosts(formattedPosts);
      } else {
        setPosts((prev) => [...prev, ...formattedPosts]);
      }

      pageRef.current = pageNum + 1;
      setPage(pageNum + 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      requestInProgress.current = false;
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    const initialize = async () => {
      await fetchTag();
      await fetchPosts(0);
    };
    initialize();
  }, [fetchTag, fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMoreRef.current) {
      fetchPosts(pageRef.current);
    }
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    setPage(0);
    hasMoreRef.current = true;
    setHasMore(true);
    setPosts([]);
    fetchPosts(0);
  }, [fetchPosts]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="flex-row justify-center items-center py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-gray-500 ml-2 dark:text-gray-400">Loading...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View className="flex-1 justify-center items-center mt-16">
        <Text className="text-gray-500 text-lg dark:text-gray-400">No posts found with this tag</Text>
      </View>
    );
  };

  const onPostPress = (item) => {
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

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      className="m-2 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm"
      onPress={() => onPostPress(item)}
    >
      {item.imgUrl && (
        <Image 
          source={{ uri: item.imgUrl }} 
          className="w-full h-40" 
          resizeMode="cover"
        />
      )}
      <View className="p-3">
        <Text 
          className="text-lg font-semibold text-gray-900 dark:text-white mb-1" 
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text 
          className="text-sm text-gray-600 dark:text-gray-300 mb-2" 
          numberOfLines={2}
        >
          {item.subtitle}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Icon name="visibility" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {item.views}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="favorite" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {item.likes}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Icon name="comment" size={16} color="#6b7280" />
            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {item.comments}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 p-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          #{tag?.tag_name || 'Tag'}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </Text>
      </View>

      <WaterfallFlow
        ref={scrollViewRef}
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPostItem}
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

      {scrollY > 200 && (
        <TouchableOpacity
          onPress={scrollToTop}
          className="absolute right-4 bottom-4 bg-blue-600 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        >
          <Icon name="arrow-upward" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TagSection;