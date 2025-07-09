import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import { useToast } from '../../../components/tip/ToastHooks';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { GRADES } from "../../../constant/user";
import { BASE_INFO } from "../../../constant/base";
import { WhiteSpace } from '@ant-design/react-native';

const MessageScreen = ({ navigation }) => {
  // 状态管理
  const [currentUser, setCurrentUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  // 加载用户数据和团队信息
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, token] = await Promise.all([
          getItemFromAsyncStorage('user'),
          getItemFromAsyncStorage('accessToken')
        ]);
        
        if (!userData || !token) {
          throw new Error('用户未登录');
        }

        setCurrentUser(userData);
        
        // 如果用户有团队，则获取团队信息
        if (userData.team_id) {
          await fetchTeamInfo(userData.team_id, token);
        }
        
        await fetchPosts(0, token);
      } catch (e) {
        setError(e.message);
        showToast(e.message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 获取团队信息
  const fetchTeamInfo = async (teamId, token) => {
    try {
      console.log(teamId);
      const response = await fetch(
        BASE_INFO.BASE_URL + `api/teams/${teamId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`获取团队信息失败: ${response.status}`);

      const result = await response.json();
      console.log(result);
      setTeamInfo(result);
    } catch (error) {
      console.error("获取团队信息失败:", error);
      throw error;
    }
  };

  // 获取文章数据
  const fetchPosts = async (pageNum, token) => {
    try {
      const response = await fetch(
        BASE_INFO.BASE_URL + `api/myposts?page=${pageNum}&size=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`请求失败: ${response.status}`);

      const result = await response.json();

      setPosts(prev => pageNum === 0 ? result.items : [...prev, ...result.items]);
      setTotalPages(result.totalPages);
      setPage(result.currentPage);
    } catch (error) {
      console.error("获取文章失败:", error);
      throw error;
    }
  };

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = await getItemFromAsyncStorage('accessToken');
      await fetchPosts(0, token);
      
      // 刷新团队信息
      if (currentUser?.team_id) {
        await fetchTeamInfo(currentUser.team_id, token);
      }
    } catch (e) {
      showToast("刷新失败", "error");
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);

  // 加载更多
  const handleLoadMore = useCallback(async () => {
    if (page >= totalPages - 1) return;
    
    try {
      const token = await getItemFromAsyncStorage('accessToken');
      await fetchPosts(page + 1, token);
    } catch (e) {
      showToast("加载更多失败", "error");
    }
  }, [page, totalPages]);

  // 渲染文章项
  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('PostDetail', {
        postId: item.post_id,
        title: item.title,
        coverImage: item.cover_image_url,
      })}
      activeOpacity={0.8}
    >
      <View className="flex-row bg-white dark:bg-gray-700 rounded-lg mb-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <Image
          source={{ uri: item.cover_image_url }}
          className="w-20 h-24 rounded-md mr-3"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text 
            className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1"
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text 
            className="text-sm text-gray-500 dark:text-gray-400 mb-2"
            numberOfLines={2}
          >
            {item.content}
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center space-x-2">
              <Image
                source={require("../../../assets/logo/ava.png")}
                className="w-5 h-5 rounded-full mr-1"
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.author.name}
              </Text>
            </View>
            <View className="flex-row space-x-3">
              <View className="flex-row items-center">
                <MaterialIcons name="favorite" size={14} color="#ef4444" />
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1 mr-2">
                  {item.likes_count}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="chat-bubble-outline" size={14} color="#3b82f6" />
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  {item.comments_count}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 学习阶段标签转换
  const getLearnStageLabel = (stageValue) => {
    return GRADES.find(grade => grade.value === stageValue)?.label || '未知';
  };

  // 加载状态
  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-500 dark:text-gray-400">加载中...</Text>
      </View>
    );
  }

  // 错误状态
  if (error) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center p-4">
        <Text className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 用户资料卡片 */}
        <View className="bg-white dark:bg-gray-800 rounded-xl mx-4 my-4 p-6 shadow-sm">
          <View className="items-center mb-4">
            <Image
              source={require("../../../assets/logo/ava.png")}
              className="w-24 h-24 rounded-full border-2 border-blue-200 dark:border-gray-600"
            />
            <Text className="text-xl font-bold text-gray-800 dark:text-white mt-3">
              {currentUser.name}
            </Text>
            <Text className="text-blue-500 dark:text-blue-400 text-sm mt-1">
              {currentUser.is_member ? '高级会员' : '普通用户'}
            </Text>
          </View>

          <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500 dark:text-gray-400">用户ID</Text>
              <Text className="text-gray-800 dark:text-gray-200">{currentUser.id}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500 dark:text-gray-400">邮箱</Text>
              <Text className="text-gray-800 dark:text-gray-200">{currentUser.email || '未设置'}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500 dark:text-gray-400">学习阶段</Text>
              <Text className="text-gray-800 dark:text-gray-200">
                {getLearnStageLabel(currentUser.learn_stage)}
              </Text>
            </View>
            {currentUser.bio && (
              <View className="mt-3">
                <Text className="text-gray-500 dark:text-gray-400 mb-1">个人简介</Text>
                <Text className="text-gray-800 dark:text-gray-200">{currentUser.bio}</Text>
              </View>
            )}
            {/* 团队信息 */}
            {currentUser.team_id && (
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-500 dark:text-gray-400">所属团队</Text>
                <View className="items-end">
                  <Text className="text-gray-800 dark:text-gray-200">
                    {teamInfo?.team_name || '加载中...'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 文章列表 */}
        <View className="bg-white dark:bg-gray-800 rounded-xl mx-4 mb-6 p-4 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800 dark:text-white">我的文章</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              共 {totalPages * 10} 篇
            </Text>
          </View>

          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item, index) => `${item.post_id}_${index}`}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <MaterialIcons name="article" size={40} color="#9ca3af" />
                <Text className="text-gray-500 dark:text-gray-400 mt-2">
                  {refreshing ? '加载中...' : '暂无文章'}
                </Text>
              </View>
            }
            ListFooterComponent={
              page < totalPages - 1 && (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#3b82f6" />
                </View>
              )
            }
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MessageScreen;