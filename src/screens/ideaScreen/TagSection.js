import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Image,
  FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GRADES } from "../../constant/user";
import axios from 'axios'
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);
const TagSection = () => {
  const route = useRoute();
  const { tagId } = route.params;
  const [tag, setTag] = useState(null);
  const [teams, setTeams] = useState([]);
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
      const response = await api.get(`${BASE_INFO.BASE_URL}api/tags/${tagId}`);
      const data = response.data;
      setTag(data);
    } catch (error) {
      console.error('Error fetching tag:', error);
    }
  }, [tagId]);

  const fetchTeams = useCallback(async (pageNum = 0) => {
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
      const url = `${BASE_INFO.BASE_URL}api/tags/${tagId}/teams?page=${pageNum}&size=20`;
      const response = await api.get(url);
      const result = response.data;

      setTotalPages(result.totalPages);

      if (pageNum >= result.totalPages - 1) {
        hasMoreRef.current = false;
        setHasMore(false);
      }

      if (pageNum === 0) {
        setTeams(result.items);
      } else {
        setTeams((prev) => [...prev, ...result.items]);
      }

      pageRef.current = pageNum + 1;
      setPage(pageNum + 1);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      requestInProgress.current = false;
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [tagId]);

  useEffect(() => {
    const initialize = async () => {
      await fetchTag();
      await fetchTeams(0);
    };
    initialize();
  }, [fetchTag, fetchTeams]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMoreRef.current) {
      fetchTeams(pageRef.current);
    }
  }, [fetchTeams]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 0;
    setPage(0);
    hasMoreRef.current = true;
    setHasMore(true);
    setTeams([]);
    fetchTeams(0);
  }, [fetchTeams]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="flex-row justify-center items-center py-4">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-gray-500 ml-2 dark:text-gray-400">加载中...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View className="flex-1 justify-center items-center mt-16">
        <Text className="text-gray-500 text-lg dark:text-gray-400">该标签下暂无团队</Text>
      </View>
    );
  };

  const onTeamPress = (team) => {
    navigation.navigate('TeamDetail', {
      teamId: team.team_id,
      teamName: team.team_name,
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

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity 
      className="m-2 p-4 mx-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600"
      onPress={() => onTeamPress(item)}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text 
            className="text-lg font-semibold text-gray-900 dark:text-white mb-1" 
            numberOfLines={1}
          >
            {item.team_name}
          </Text>
          <View className="flex-row items-center mb-2">
            <Icon name="people" size={16} color="#6b7280" />
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              {item.member_count} 名成员
            </Text>
          </View>
          <View className="flex-row flex-wrap">
          </View>
        </View>
        <View className="bg-gray-100 dark:bg-gray-700 rounded-full w-10 h-10 items-center justify-center ml-2">
          <Icon name="groups" size={20} color="#6b7280" />
        </View>
      </View>
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          创建于 {new Date(item.create_at).toLocaleDateString()}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          推荐加入等级：{GRADES.find(grade => grade.value ===item.grade)?.label || '未知'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 p-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          #{tag?.tag_name || '标签'}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {teams.length} {teams.length === 1 ? '个团队' : '个团队'}
        </Text>
      </View>

      <FlatList
        ref={scrollViewRef}
        data={teams}
        keyExtractor={(item) => item.team_id.toString()}
        renderItem={renderTeamItem}
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
        contentContainerStyle={{ paddingBottom: 20 }}
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