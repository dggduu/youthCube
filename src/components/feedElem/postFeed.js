import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import WaterfallFlow from 'react-native-waterfall-flow';
import FeedElem from './feedElem';
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from "../../constant/base";

const PostFeed = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const navigation = useNavigation();

  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const lastRequestTime = useRef(0);
  const requestInProgress = useRef(false);

  const fetchData = useCallback(async (pageNum) => {

    if (requestInProgress.current || loadingRef.current || (!hasMoreRef.current && pageNum > 0)) {
      return;
    }

    // 确保请求间隔至少500ms
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime.current;
    if (timeSinceLast < 500) {
      await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLast));
    }

    requestInProgress.current = true;
    loadingRef.current = true;
    setLoading(true);
    lastRequestTime.current = Date.now();

    try {
      console.log(`${BASE_INFO.BASE_URL}api/posts?page=${pageNum}&size=10`);
      const response = await fetch(`${BASE_INFO.BASE_URL}api/posts?page=${pageNum}&size=10`);
      const result = await response.json();

      const newData = result.items.map((item, index) => ({
        id: item.post_id,
        imgUrl: item.cover_image_url,
        title: item.title,
        subtitle: item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content,
        height: index % 3 === 0 ? 300 : index % 2 === 0 ? 250 : 200
      }));

      setTotalPages(result.totalPages);
      
      if (pageNum >= result.totalPages - 1) {
        hasMoreRef.current = false;
        setHasMore(false);
      } else {
        setData(prevData => (pageNum === 0 ? newData : [...prevData, ...newData]));
        pageRef.current = pageNum + 1;
        setPage(pageNum + 1);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      requestInProgress.current = false;
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无内容</Text>
      </View>
    );
  };

  const onFeedElemPress = (item) => {
    navigation.navigate('PostDetail', { 
      postId: item.id,
      title: item.title,
      coverImage: item.imgUrl
    });
  };

  return (
    <View style={styles.container}>
      <WaterfallFlow
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
            tintColor={'#3b82f6'}
          />
        }
        contentContainerStyle={styles.contentContainer}
        itemHeight={(item) => item.height}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  footer: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default PostFeed;