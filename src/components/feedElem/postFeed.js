import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import FeedElem from './FeedElem'; // 确保路径正确

const PostFeed = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 模拟数据加载
  const fetchData = useCallback(async (pageNum) => {
    if (loading || !hasMore && pageNum > 1) return; // 防止重复加载或没有更多数据时继续加载
    setLoading(true);
    try {
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newData = Array.from({ length: 10 }, (_, i) => ({
        id: (pageNum - 1) * 10 + i,
        imgUrl: `https://picsum.photos/seed/${(pageNum - 1) * 10 + i}/300/200`, // 随机图片
        title: `Post Title ${(pageNum - 1) * 10 + i + 1}`,
        subtitle: `This is a short description for post ${(pageNum - 1) * 10 + i + 1}.`,
      }));

      if (newData.length === 0) {
        setHasMore(false); // 没有更多数据了
      } else {
        setData(prevData => (pageNum === 1 ? newData : [...prevData, ...newData]));
        setPage(pageNum + 1);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // 可以添加错误处理，例如显示一个错误消息
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    fetchData(1); // 组件首次渲染时加载第一页数据
  }, [fetchData]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchData(page);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1); // 重置页码
    setHasMore(true); // 重新设置为有更多数据
    setData([]); // 清空现有数据
    fetchData(1); // 重新加载第一页
  }, [fetchData]);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading && data.length === 0) return null; // 首次加载时不显示“无数据”
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无内容</Text>
      </View>
    );
  };

  const onFeedElemPress = (item) => {
    console.log("Post pressed:", item.title);
    // 这里可以导航到详情页或者执行其他操作
    alert(`你点击了：${item.title}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
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
        numColumns={2} // 两列布局
        columnWrapperStyle={styles.row} // 行样式
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // 距离底部50%时触发加载
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#009688']} // Android 下拉刷新指示器颜色
            tintColor={'#009688'} // iOS 下拉刷新指示器颜色
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // 背景色
  },
  row: {
    justifyContent: 'space-around', // 项目之间和边缘有相同的间距
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ced0ce',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});

export default PostFeed;