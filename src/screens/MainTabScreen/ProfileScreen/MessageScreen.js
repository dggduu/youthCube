import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ActivityIndicator, 
  SafeAreaView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import { useToast } from '../../../components/tip/ToastHooks';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { GRADES } from "../../../constant/user";
import { BASE_INFO } from "../../../constant/base";
import WaterfallFlow from 'react-native-waterfall-flow';
import FeedElem from "../../../components/feedElem/feedElem";
import BackIcon from "../../../components/backIcon/backIcon";
import axios from 'axios';
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
import { WhiteSpace } from '@ant-design/react-native';

const api = axios.create();
setupAuthInterceptors(api);

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
  const [loadingMore, setLoadingMore] = useState(false);
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

  // 获取团队信息 (使用axios)
  const fetchTeamInfo = async (teamId, token) => {
    try {
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/teams/${teamId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTeamInfo(response.data);
    } catch (error) {
      console.error("获取团队信息失败:", error);
      throw error;
    }
  };

  // 获取文章数据 (使用axios)
  const fetchPosts = async (pageNum, token) => {
    try {
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/myposts?page=${pageNum}&size=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      setPosts(prev => pageNum === 0 ? result.items : [...prev, ...result.items]);
      setTotalPages(result.totalPages);
      setPage(result.currentPage);
    } catch (error) {
      console.error("获取文章失败:", error);
      throw error;
    } finally {
      setLoadingMore(false);
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
    if (loadingMore || page >= totalPages - 1) return;
    
    try {
      setLoadingMore(true);
      const token = await getItemFromAsyncStorage('accessToken');
      await fetchPosts(page + 1, token);
    } catch (e) {
      showToast("加载更多失败", "error");
      setLoadingMore(false);
    }
  }, [page, totalPages, loadingMore]);

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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <WaterfallFlow
        data={posts}
        renderItem={({ item }) => (
          <FeedElem
            imgUrl={item.cover_image_url}
            title={item.title}
            subtitle={item.subtitle}
            onPress={() => navigation.navigate('PostDetail', {
              postId: item.post_id,
              title: item.title,
              coverImage: item.cover_image_url,
            })}
          />
        )}
        keyExtractor={(item, index) => `${item.post_id}_${index}`}
        numColumns={2}
        initialNumToRender={10}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            <BackIcon/>
            <View className="bg-white dark:bg-gray-800 my-3 p-6 rounded-xl shadow-sm shadow-gray-200 dark:shadow-gray-900 mx-3">
              
              {/* 用户资料卡片 */}
              <View className="items-center mb-4">
                <Image
                  source={require("../../../assets/logo/ava.png")}
                  className="w-24 h-24 rounded-full border-2 border-blue-200 dark:border-gray-600"
                />
                <Text 
                  className="text-xl font-bold text-gray-800 dark:text-white mt-3"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {currentUser.name}
                </Text>
                <Text 
                  className="text-[#409eff] dark:text-[#409eff] text-sm mt-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {currentUser.is_member ? '高级会员' : '普通用户'}
                </Text>
              </View>

              <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-500 dark:text-gray-400">用户ID</Text>
                  <Text 
                    className="text-gray-800 dark:text-gray-200"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {currentUser.id}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-500 dark:text-gray-400">邮箱</Text>
                  <Text 
                    className="text-gray-800 dark:text-gray-200 flex-1 text-right ml-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {currentUser.email || '未设置'}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-gray-500 dark:text-gray-400">学习阶段</Text>
                  <Text 
                    className="text-gray-800 dark:text-gray-200"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {getLearnStageLabel(currentUser.learn_stage)}
                  </Text>
                </View>
                {currentUser.bio && (
                  <View className="mt-3">
                    <Text className="text-gray-500 dark:text-gray-400 mb-1">个人简介</Text>
                    <Text 
                      className="text-gray-800 dark:text-gray-200"
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {currentUser.bio}
                    </Text>
                  </View>
                )}
                {/* 团队信息 */}
                {currentUser.team_id && (
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-500 dark:text-gray-400">所属团队</Text>
                    <View className="flex-1 ml-2">
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-gray-800 dark:text-gray-200 text-right"
                      >
                        {teamInfo?.team_name || '加载中...'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="py-8 items-center">
            <MaterialIcons name="article" size={40} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400 mt-2">
              {refreshing ? '加载中...' : '暂无文章'}
            </Text>
          </View>
        }
        ListFooterComponent={
          loadingMore && (
            <View className="py-4 flex-row justify-center items-center">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-gray-500 dark:text-gray-400 ml-2">加载更多...</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

export default MessageScreen;