import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ActivityIndicator, 
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  StatusBar
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
import { useColorScheme } from "nativewind";
import { Shadow } from 'react-native-shadow-2';

const api = axios.create();
setupAuthInterceptors(api);

const MessageScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { showToast } = useToast();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const fetchTeamInfo = async (teamId, token) => {
    try {
      const response = await api.get(`${BASE_INFO.BASE_URL}api/teams/${teamId}`);
      setTeamInfo(response.data);
    } catch (error) {
      console.error("获取团队信息失败:", error);
      throw error;
    }
  };

  const fetchPosts = async (pageNum, token) => {
    try {
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/myposts?page=${pageNum}&size=10`
      );
      const result = response.data;
      setPosts(prev => pageNum === 0 ? result.items : [...prev, ...result.items]);
      setTotalPages(result.totalPages);
      setPage(result.currentPage);
      setTotalPosts(result.totalItems);
    } catch (error) {
      console.error("获取文章失败:", error);
      throw error;
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = await getItemFromAsyncStorage('accessToken');
      await fetchPosts(0, token);
      
      if (currentUser?.team_id) {
        await fetchTeamInfo(currentUser.team_id, token);
      }
    } catch (e) {
      showToast("刷新失败", "error");
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);

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

  const getLearnStageLabel = (stageValue) => {
    return GRADES.find(grade => grade.value === stageValue)?.label || '未知';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-500 dark:text-gray-400">加载中...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center p-4">
        <Text className="text-[#f56c6c] dark:text-red-400 text-lg mb-4 text-center">{error}</Text>
        <TouchableOpacity onPress={handleRefresh} className="p-3 bg-[#409eff] rounded-lg">
          <Text className="text-white font-semibold">重新加载</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <BackIcon/>
      <WaterfallFlow
        data={posts}
        renderItem={({ item }) => (
          <FeedElem
            imgUrl={item.cover_image_url}
            title={item.title}
            subtitle={item.content.slice(0,40)}
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
          <View className="px-4 mt-2">

            {/* --- 用户名片 --- */}
              <View className={`bg-white dark:bg-gray-800 p-6 rounded-t-2xl`}>
                <View className="flex-row items-center mb-4">
                  <Image
                    source={require("../../../assets/logo/ava.png")}
                    className="w-24 h-24 rounded-full border-4 border-blue-200 dark:border-gray-600"
                  />
                  <View className="flex-1 ml-4">
                    <Text 
                      className="text-2xl font-bold text-gray-900 dark:text-white"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {currentUser.name}
                    </Text>
                    <Text 
                      className="text-sm text-blue-500 dark:text-blue-400 font-semibold mt-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {currentUser.is_member ? '高级会员' : '普通用户'}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">学习阶段：</Text>
                      <Text className="text-gray-800 dark:text-gray-200 text-sm">{getLearnStageLabel(currentUser.learn_stage)}</Text>
                    </View>
                  </View>
                </View>

                {/* 统计数据 */}
                <View className="flex-row justify-around items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                  <View className="items-center flex-1">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">{totalPosts}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">总投稿数</Text>
                  </View>
                  <View className="items-center flex-1 border-x border-gray-200 dark:border-gray-700">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.followerCount}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">关注</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.followingCount}</Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">粉丝</Text>
                  </View>
                </View>
              </View>
            
            {/* --- 个人简介卡片 --- */}
            {currentUser.bio && (
                <View className={`bg-white dark:bg-gray-800 p-6 rounded-b-2xl`}>
                  <View className="flex-row items-center">
                    <MaterialIcons name="account-circle" size={24} color="#3b82f6" />
                    <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                      个人简介
                    </Text>
                  </View>
                  <Text 
                    className="text-gray-800 dark:text-gray-200 mt-3" 
                    numberOfLines={4} 
                    ellipsizeMode="tail"
                  >
                    {currentUser.bio}
                  </Text>
                </View>
            )}
            {/* --- 队伍信息卡片 --- */}
            {currentUser.team_id && (
                <View className={`bg-white dark:bg-gray-800 p-6 rounded-2xl mt-3 `}>
                  <View className="flex-row items-center mb-3">
                    <MaterialIcons name="group" size={24} color="#3b82f6" />
                    <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                      我的队伍
                    </Text>
                  </View>
                  <View className="mb-2">
                    <Text 
                      className="text-gray-500 dark:text-gray-400"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      队伍名称: <Text className="font-semibold text-gray-800 dark:text-gray-200">{teamInfo?.team_name || '加载中...'}</Text>
                    </Text>
                  </View>
                  {teamInfo?.description && (
                    <View>
                      <Text className="text-gray-500 dark:text-gray-400">队伍简介:</Text>
                      <Text 
                        className="text-gray-800 dark:text-gray-200 mt-1"
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {teamInfo.description}
                      </Text>
                    </View>
                  )}
                </View>
            )}
            <View className="flex-row items-center mt-6 mb-2">
              <MaterialIcons name="article" size={24} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">
                我的文章
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="py-8 items-center">
            <MaterialIcons name="article" size={48} color="#9ca3af" />
            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-base">
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
        contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
};

export default MessageScreen;