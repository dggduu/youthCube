import React, { useEffect, useLayoutEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ActivityIndicator, 
  SafeAreaView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { getItemFromAsyncStorage } from "../utils/LocalStorage";
import { useToast } from '../components/tip/ToastHooks';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { GRADES } from "../constant/user";
import { BASE_INFO } from "../constant/base";
import WaterfallFlow from 'react-native-waterfall-flow';
import FeedElem from "../components/feedElem/feedElem";
import { useNavigation, useRoute } from "@react-navigation/native";

const PersonalProfile = () => {
  // 状态管理
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  const navigation = useNavigation();
  const route = useRoute();
  const { user_id, user_name } = route.params;

  useLayoutEffect(()=>{
    navigation.setOptions({
        title: user_name
    });
  },[]);
  // 学习阶段标签转换
  const getLearnStageLabel = (stageValue) => {
    return GRADES.find(grade => grade.value === stageValue)?.label || '未知';
  };

  // 加载用户数据
  const loadData = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    try {
      const token = await getItemFromAsyncStorage('accessToken');
      const response = await fetch(`${BASE_INFO.BASE_URL}api/users/${user_id}`);

      if (!response.ok) throw new Error('获取用户数据失败');

      const userData = await response.json();

      setCurrentUser(userData);
      setPosts(userData.posts || []);
    } catch (e) {
      setError(e.message);
      showToast(`加载失败: ${e.message}`, "error");
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  // 初次加载
  useEffect(() => {
    loadData();
  }, []);

  // 下拉刷新
  const handleRefresh = () => {
    loadData(true);
  };

  // 加载中状态
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
        <TouchableOpacity
          onPress={handleRefresh}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900 px-3">
      <WaterfallFlow
        data={posts}
        renderItem={({ item }) => (
          <FeedElem
            imgUrl={item.cover_image_url}
            title={item.title}
            likes={item.likes_count}
            comments={item.comments_count}
            collects={item.collected_count}
               onPress={()=>{
                navigation.navigate("Post",{
                  screen: "PostDetail",
                  params :{
                    postId: item.post_id
                  }
                });
              }}
          />
        )}
        keyExtractor={(item) => `post-${item.post_id}`}
        numColumns={2}
        initialNumToRender={10}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View className="bg-white dark:bg-gray-800 my-3 p-6 rounded-xl shadow-sm shadow-gray-200 dark:shadow-gray-900">
            {/* 用户资料卡片 */}
            <View className="items-center mb-4">
              {currentUser.avatar_key ? (
                <Image
                  source={{ uri: currentUser.avatar_key }}
                  className="w-24 h-24 rounded-full border-2 border-blue-200 dark:border-gray-600"
                />
              ) : (
                <Image
                  source={require("../assets/logo/ava.png")}
                  className="w-24 h-24 rounded-full border-2 border-blue-200 dark:border-gray-600"
                />
              )}
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
                <Text className="text-gray-500 dark:text-gray-400">联系邮箱</Text>
                <Text className="text-gray-800 dark:text-gray-200">{currentUser.email || '未设置'}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-500 dark:text-gray-400">性别</Text>
                <Text className="text-gray-800 dark:text-gray-200">{currentUser.sex || '未设置'}</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-500 dark:text-gray-400">出生日期</Text>
                <Text className="text-gray-800 dark:text-gray-200">{currentUser.birth_date || '未设置'}</Text>
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
              {currentUser.team && (
                <View className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 rounded-xl">
                  <Text className="text-gray-500 dark:text-gray-400 mb-2">所属团队</Text>
                  <Text className="text-blue-600 dark:text-blue-400 font-semibold">{currentUser.team.team_name}</Text>
                  <Text className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{currentUser.team.description}</Text>
                </View>
              )}
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

export default PersonalProfile;