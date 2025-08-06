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
  const [accessToken, setAccessToken] = useState(null);
  useLayoutEffect(() => {
    navigation.setOptions({
      title: user_name
    });
  }, []);

  const getLearnStageLabel = (stageValue) => {
    return GRADES.find(grade => grade.value === stageValue)?.label || '未知';
  };

  const handlePrivateChat = async () => {
    if (localId.id === currentUser.id) {
      showToast('不能与自己私聊', 'warning');
      return;
    }

    try {
      setLoading(true);
      const token = await getItemFromAsyncStorage('accessToken');
      setAccessToken(token);
      
      const getResponse = await api.get(
        `${BASE_INFO.BASE_URL}api/chatrooms/private/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (getResponse.data.chatRoomId) {
        navigation.navigate("Chat", {
          screen: "single",
          params: {
            chatId: getResponse.data.chatRoomId,
            name: currentUser.name
          }
        });
        return;
      }
    } catch (getError) {
      if (getError.response?.status === 404) {
        try {
          const createResponse = await api.post(
            `${BASE_INFO.BASE_URL}api/chatrooms/private`,
            { targetUserId: parseInt(user_id) },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (createResponse.data.chatRoomId) {
            navigation.navigate("Chat", {
              screen: "single",
              params: {
                chatId: createResponse.data.chatRoomId,
                name: currentUser.name
              }
            });
          }
        } catch (createError) {
          showToast('创建私聊失败', 'error');
          console.error('Create private chat error:', createError);
        }
      } else {
        showToast('获取私聊信息失败', 'error');
        console.error('Get private chat error:', getError);
      }
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const token = await getItemFromAsyncStorage('accessToken');
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/invite/friend`,
        {
          user_id: user_id,
          email: localId?.email || '',
          desciption: description || '我想添加您为好友'
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
    } catch (err) {
      let errorMessage = '发送失败';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = '网络错误，请检查您的连接';
      } else {
        errorMessage = err.message;
      }
      showToast(`${errorMessage}`, "error");
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
          className="bg-[#409eff] px-4 py-2 rounded"
        >
          <Text className="text-white">重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 px-3">
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
   <View className="bg-white dark:bg-gray-800 my-3 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-700">
      {/* 用户头像与基本信息 */}
      <View className="items-center mb-4">
        {currentUser.avatar_key ? (
          <Image
            source={{ uri: currentUser.avatar_key }}
            className="w-24 h-24 rounded-full border-2 border-blue-100 dark:border-gray-600"
          />
        ) : (
          <Image
            source={require('../assets/logo/ava.png')}
            className="w-24 h-24 rounded-full border-2 border-blue-100 dark:border-gray-600"
          />
        )}
        <Text className="text-xl font-semibold text-gray-800 dark:text-white mt-3">
          {currentUser.name}
        </Text>
        <Text className="text-sm text-blue-500 dark:text-blue-400 mt-1 font-medium">
          {currentUser.is_member ? '高级会员' : '普通用户'}
        </Text>

        {/* 当前用户不是自己时，显示操作按钮 */}
        {localId.id !== currentUser.id && (
          <View className="flex-row gap-3 mt-4">
            {!isFriendRequestSent ? (
              <TouchableOpacity
                onPress={openFriendRequestModal}
                disabled={!canSendRequest}
                className="bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-full flex-row items-center active:bg-blue-600 dark:active:bg-blue-700"
              >
                <MaterialIcons name="person-add" size={18} color="white" />
                <Text className="text-white ml-1 text-sm font-medium">
                  {canSendRequest ? '添加好友' : '请稍后再试'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full">
                <Text className="text-gray-600 dark:text-gray-300 text-sm">
                  {currentUser.friend_status === 'accepted' ? '已是好友' : '申请已发送'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handlePrivateChat}
              className="bg-emerald-500 dark:bg-emerald-600 px-4 py-2 rounded-full flex-row items-center active:bg-emerald-600 dark:active:bg-emerald-700"
            >
              <MaterialIcons name="chat" size={18} color="white" />
              <Text className="text-white ml-1 text-sm font-medium">私聊</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 详细信息 */}
      <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">用户ID</Text>
          <Text className="text-sm text-gray-800 dark:text-gray-200 font-medium">{currentUser.id}</Text>
        </View>
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">联系邮箱</Text>
          <Text className="text-sm text-gray-800 dark:text-gray-200">{currentUser.email || '未设置'}</Text>
        </View>
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">性别</Text>
          <Text className="text-sm text-gray-800 dark:text-gray-200">{currentUser.sex || '未设置'}</Text>
        </View>
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">出生日期</Text>
          <Text className="text-sm text-gray-800 dark:text-gray-200">{currentUser.birth_date || '未设置'}</Text>
        </View>
        <View className="flex-row justify-between items-center py-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">学习阶段</Text>
          <Text className="text-sm text-gray-800 dark:text-gray-200">{getLearnStageLabel(currentUser.learn_stage)}</Text>
        </View>

        {currentUser.bio && (
          <View className="mt-3">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">个人简介</Text>
            <Text className="text-sm text-gray-800 dark:text-gray-200 leading-5">{currentUser.bio}</Text>
          </View>
        )}

        {/* 团队信息 - 可点击 */}
        {currentUser.team && (
          <TouchableOpacity
            onPress={()=>{
              navigation.navigate("TeamDetail", {teamId: currentUser.team_id, teamName: currentUser.team.team_name});
            }}
            activeOpacity={0.7}
            className="mt-4 p-3 bg-blue-50 dark:bg-gray-700/50 rounded-xl border border-blue-100 dark:border-gray-600"
          >
            <Text className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-1">所属团队</Text>
            <Text className="text-base font-semibold text-blue-700 dark:text-blue-400">{currentUser.team.team_name}</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300 mt-1">{currentUser.team.description}</Text>
          </TouchableOpacity>
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
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-gray-800 dark:text-white h-32"
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
                className="px-4 py-2 bg-[#409eff] rounded-lg ml-2"
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