import React, { useEffect, useLayoutEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ActivityIndicator, 
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { getItemFromAsyncStorage } from "../utils/LocalStorage";
import { useToast } from '../components/tip/ToastHooks';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { GRADES } from "../constant/user";
import { BASE_INFO } from "../constant/base";
import WaterfallFlow from 'react-native-waterfall-flow';
import FeedElem from "../components/feedElem/feedElem";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from 'axios';
import setupAuthInterceptors from "../utils/axios/AuthInterceptors";

const api = axios.create();
setupAuthInterceptors(api);

const PersonalProfile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [description, setDescription] = useState('');
  const [canSendRequest, setCanSendRequest] = useState(true);
  const { showToast } = useToast();
  const [localId, setLocalId] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const { user_id, user_name } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: user_name
    });
  }, []);

  const getLearnStageLabel = (stageValue) => {
    return GRADES.find(grade => grade.value === stageValue)?.label || '未知';
  };

  const sendFriendRequest = async () => {
    try {
      const token = await getItemFromAsyncStorage('accessToken');
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/invite/friend`,
        {
          user_id: user_id,
          email: localId?.email || '',
          description: description || '我想添加您为好友'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        setIsFriendRequestSent(true);
        setShowFriendModal(false);
        setDescription('');
        setCanSendRequest(false);
        
        setTimeout(() => {
          showToast('好友申请已发送', 'success');
        }, 100);
        
        const timer = setTimeout(() => {
          setCanSendRequest(true);
        }, 5 * 60 * 1000);
        
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      showToast('发送好友申请失败: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const openFriendRequestModal = () => {
    if (!canSendRequest) {
      showToast('请等待5分钟后再发送申请', 'warning');
      return;
    }
    setShowFriendModal(true);
  };

  const closeFriendRequestModal = () => {
    setShowFriendModal(false);
    setDescription('');
  };

  const confirmFriendRequest = () => {
    if (!description.trim()) {
      showToast('请输入申请理由', 'warning');
      return;
    }
    
    Alert.alert(
      '发送好友申请',
      `确定要向 ${user_name} 发送好友申请吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: sendFriendRequest,
        },
      ],
      { cancelable: true }
    );
  };

  const loadData = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    try {
      const token = await getItemFromAsyncStorage('accessToken');
      const user = await getItemFromAsyncStorage("user");
      setLocalId(user);
      
      const response = await api.get(`${BASE_INFO.BASE_URL}api/users/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;
      console.log(userData);
      setCurrentUser(userData);
      setPosts(Array.isArray(userData.posts) ? userData.posts : []);
      setIsFriendRequestSent(userData.friend_status === 'pending' || userData.friend_status === 'accepted');
    } catch (e) {
      setError(e.message);
      showToast(`加载失败: ${e.message}`, "error");
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-gray-500 dark:text-gray-400">加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center p-4">
        <Text className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</Text>
        <TouchableOpacity
          onPress={loadData}
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
            onPress={() => {
              navigation.navigate("Post", {
                screen: "PostDetail",
                params: {
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
              
              {localId.id !== currentUser.id && (
                !isFriendRequestSent ? (
                  <TouchableOpacity
                    onPress={openFriendRequestModal}
                    className="mt-4 bg-blue-500 px-6 py-2 rounded-full flex-row items-center"
                    disabled={!canSendRequest}
                  >
                    <MaterialIcons name="person-add" size={18} color="white" />
                    <Text className="text-white ml-2">
                      {canSendRequest ? '添加好友' : '请稍后再试'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="mt-4 bg-gray-200 dark:bg-gray-600 px-6 py-2 rounded-full">
                    <Text className="text-gray-700 dark:text-gray-200">
                      {currentUser.friend_status === 'accepted' ? '已是好友' : '申请已发送'}
                    </Text>
                  </View>
                )
              )}
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
            onRefresh={loadData}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 40 }}
      />

      <Modal
        visible={showFriendModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFriendRequestModal}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              发送好友申请给 {user_name}
            </Text>
            
            <Text className="text-gray-600 dark:text-gray-300 mb-2">
              申请理由:
            </Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-gray-800 dark:text-white h-32"
              multiline
              placeholder="请输入申请理由..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
            />
            
            <View className="flex-row justify-end space-x-3 mt-6">
              <TouchableOpacity
                onPress={closeFriendRequestModal}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                <Text className="text-gray-800 dark:text-gray-200">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmFriendRequest}
                className="px-4 py-2 bg-blue-500 rounded-lg ml-2"
              >
                <Text className="text-white">发送申请</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PersonalProfile;