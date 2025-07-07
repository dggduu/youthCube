import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, FlatList, SafeAreaView } from 'react-native';
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import { useToast } from '../../../components/tip/ToastHooks';
import BackIcon from "../../../components/backIcon/backIcon";
import MaterialIcons from "@react-native-vector-icons/material-icons";
const MessageScreen = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getItemFromAsyncStorage('user');
        console.log("Loaded UserData from AsyncStorage:", userData);

        if (userData) {
          setCurrentUser(userData);
        } else {
          setError("本地存储中未找到用户资料。请尝试重新登录。");
          showToast("用户资料数据缺失。", "error");
        }
      } catch (e) {
        console.error("从 AsyncStorage 加载用户数据时出错:", e);
        setError("加载用户资料失败。 " + e.message);
        showToast("加载资料错误: " + e.message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (loading) {
    return (
      <View className='flex-1 bg-white dark:bg-gray-800'>
        <BackIcon/>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-gray-700 dark:text-gray-300 text-base">正在加载用户资料...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 bg-white dark:bg-gray-80'>
        <BackIcon/>
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-600 dark:text-red-400 text-base text-center">错误: {error}</Text>
        </View>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View className='flex-1 bg-white dark:bg-gray-800'>
        <BackIcon/>
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-600 dark:text-gray-400 text-lg text-center">无可用用户数据。</Text>
        </View>
      </View>
    );
  }

  // 渲染单个文章项的辅助函数
const renderPostItem = ({ item }) => (
  <View className="flex-row bg-gray-50 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden items-center p-3 border border-gray-200 dark:border-gray-600">
    <Image
      source={{ uri: item.cover_image_url || require("../../../assets/logo/ava.png") }}
      className="w-16 h-16 rounded-md mr-3"
    />
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{item.title}</Text>
      <View className="flex-row items-center space-x-4">
        <View className="flex-row items-center">
          <MaterialIcons name="favorite" size={14} color="#ef4444" />
          <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">{item.likes_count}  </Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="chat-bubble-outline" size={14} color="#3b82f6" />
          <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">{item.comments_count}  </Text>
        </View>
        <View className="flex-row items-center">
          <MaterialIcons name="bookmark-border" size={14} color="#10b981" />
          <Text className="text-xs text-gray-600 dark:text-gray-400 ml-1">{item.collected_count}  </Text>
        </View>
      </View>
    </View>
  </View>
);

  return (
    <SafeAreaView className='flex-1'>
      <BackIcon/>
      <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
        {/* 个人资料头部 */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 items-center mb-4 mt-5 shadow-md">
          <Image
            source={ require("../../../assets/logo/ava.png") }
            className="w-24 h-24 rounded-full mb-3 border-2 border-gray-200 dark:border-gray-600"
          />
          <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currentUser.name || 'N/A'}</Text>
          <Text className="text-base text-gray-600 dark:text-gray-400 mb-1">{currentUser.email || 'N/A'}</Text>
          <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3">
            {currentUser.is_member ? '高级会员' : '普通用户'}
          </Text>
          <Text className="text-sm text-gray-700 dark:text-gray-300 text-center mx-2 leading-5">
            {currentUser.bio || '暂无个人简介。'}
          </Text>
        </View>

        {/* 用户详情 */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-md">
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">详细信息</Text>
          <Text className="text-base text-gray-700 dark:text-gray-300 mb-2">ID: {currentUser.id}</Text>
          <Text className="text-base text-gray-700 dark:text-gray-300 mb-2">出生日期: {currentUser.birth_date || 'N/A'}</Text>
          <Text className="text-base text-gray-700 dark:text-gray-300 mb-2">学习阶段: {currentUser.learn_stage || 'N/A'}</Text>
          <Text className="text-base text-gray-700 dark:text-gray-300 mb-2">性别: {currentUser.sex || 'N/A'}</Text>
        </View>

        {/* 团队信息 */}
        {currentUser.team && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-md">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
              所属团队: {currentUser.team.team_name}
            </Text>
            <Text className="text-sm text-gray-700 dark:text-gray-300 leading-5">
              {currentUser.team.description}
            </Text>
          </View>
        )}

        {/* 用户文章 */}
        {currentUser.posts && currentUser.posts.length > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-md">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
              我的文章 ({currentUser.posts.length})
            </Text>
            <FlatList
              data={currentUser.posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.post_id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
        {currentUser.posts && currentUser.posts.length === 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 items-center justify-center mb-4 shadow-md">
            <Text className="text-base text-gray-600 dark:text-gray-400">暂无文章。</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MessageScreen;