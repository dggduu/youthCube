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
import TeamCard from './TeamCard';
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import MatrialIcons from "@react-native-vector-icons/material-icons";
import { navigate } from "../../navigation/NavigatorRef";
const TeamFeed = () => {
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
        const url = `${BASE_INFO.BASE_URL}api/teams?page=${pageNum}&size=15`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        const result = await response.json();

        const newData = result.items.map((item) => ({
          id: item.team_id,
          title: item.team_name,
          subtitle: item.create_at.split('T')[0],
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
        setPage(pageNum + 1);
      } catch (error) {
        console.error('Error fetching team data:', error);
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
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16 }}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={{ marginLeft: 8, color: '#6b7280' }}>加载中...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 64 }}>
        <Text style={{ color: '#6b7280', fontSize: 16 }}>暂无团队</Text>
      </View>
    );
  };

  const onTeamPress = (item) => {
    navigate('RootIdea', { screen: 'TeamDetail', params: {
      teamId: item.id,
      teamName: item.title,
    } });
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
    <View style={{ flex: 1, backgroundColor: IsDark ? '#111827' : '#f9fafb' }}>
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
        numColumns={1}
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
        contentContainerStyle={{ paddingBottom: 80 }}
        itemHeight={() => 250}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* 返回顶部按钮 */}
      {scrollY > 200 && (
        <TouchableOpacity
          onPress={scrollToTop}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            backgroundColor: IsDark ? '#6d28d9' : '#8b5cf6',
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
          }}
        >
          <MatrialIcons name="arrow-upward" size={20} color={IsDark ? '#ccc' : '#fff'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TeamFeed;