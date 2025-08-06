import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import WaterfallFlow from 'react-native-waterfall-flow';
import TeamCard from './TeamCard';
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { navigate } from '../../navigation/NavigatorRef';
import axios from 'axios';
import setupAuthInterceptors from '../../utils/axios/AuthInterceptors';

const api = axios.create();
setupAuthInterceptors(api);

const TeamFeed = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const lastRequestTime = useRef(0);
  const requestInProgress = useRef(false);
  const scrollViewRef = useRef(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();

  // 拉取数据
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
      if (now - lastRequestTime.current < 500) {
        await new Promise((resolve) => setTimeout(resolve, 500 - (now - lastRequestTime.current)));
      }

      requestInProgress.current = true;
      loadingRef.current = true;
      setLoading(true);
      lastRequestTime.current = now;

      try {
        const url = `${BASE_INFO.BASE_URL}api/teams?page=${pageNum}&size=15`;
        const response = await api.get(url);
        const result = response.data;

        const newData = result.items.map((item) => ({
          id: item.team_id,
          title: item.team_name,
          subtitle: new Date(item.create_at).toLocaleDateString(),
          tags: item.tags || [],
          height: 250,
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
      } catch (error) {
        console.error('Error fetching team data:', error);
        if (pageNum === 0) {
          setData([]);
        }
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
    if (!loading && hasMore) {
      fetchData(pageRef.current);
    }
  }, [loading, hasMore, fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    setData([]);
    fetchData(0);
  }, [fetchData]);

  // 底部加载更多
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="flex-row justify-center items-center py-4">
        <MaterialIcons name="hourglass-empty" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
        <Text className="ml-2 text-gray-500 dark:text-gray-400">加载中...</Text>
      </View>
    );
  };

  // 空状态
  const renderEmptyComponent = () => {
    if (loading || refreshing) return null;
    return (
      <View className="flex-1 justify-center items-center mt-16">
        <MaterialIcons name="folder-off" size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
        <Text className="mt-2 text-lg text-gray-500 dark:text-gray-400">暂无团队</Text>
      </View>
    );
  };

  // 卡片点击
  const onTeamPress = (item) => {
    navigate('RootIdea', {
      screen: 'TeamDetail',
      params: {
        teamId: item.id,
        teamName: item.title,
      },
    });
  };

  // 滚动到顶部
  const scrollToTop = () => {
    scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
  };

  const [scrollY, setScrollY] = useState(0);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 pt-2 rounded-t-lg">
      {/* 标题 */}
      <Text className="font-semibold text-2xl text-gray-800 dark:text-gray-100 ml-5 mt-3 mb-4">
        队伍：
      </Text>

      {/* 瀑布流 */}
      <WaterfallFlow
        ref={scrollViewRef}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TeamCard
            title={item.title}
            subtitle={item.subtitle}
            tags={item.tags.slice(0, 4)}
            onPress={() => onTeamPress(item)}
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
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 100 }}
        itemHeight={() => 250}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* 返回顶部按钮 */}
      {scrollY > 300 && (
        <TouchableOpacity
          onPress={scrollToTop}
          activeOpacity={0.7}
          className="absolute right-5 bottom-6 bg-violet-600 dark:bg-violet-500 w-12 h-12 rounded-full justify-center items-center shadow-lg"
          style={{
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
        >
          <MaterialIcons name="arrow-upward" size={20} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TeamFeed;