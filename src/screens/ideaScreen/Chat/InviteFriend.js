import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getItemFromAsyncStorage, setItemToAsyncStorage } from "../../../utils/LocalStorage";
import { BASE_INFO } from "../../../constant/base";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useToast } from "../../../components/tip/ToastHooks";
import axios from "axios";

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const STORAGE_KEY = 'invited_users';

const InviteFriend = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { chatRoom_id, team_id } = route.params;
  const showToast = useToast();
  
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [page, setPage] = useState(0);
  const [invitedUsers, setInvitedUsers] = useState(new Set());
  const size = 10;

  // 从存储加载已邀请用户
  const loadInvitedUsers = async () => {
    try {
      const storedData = await getItemFromAsyncStorage(STORAGE_KEY);
      if (storedData) {
        const parsedData = storedData;
        // 只存储当前小组的邀请记录
        const teamInvites = parsedData[team_id] || [];
        setInvitedUsers(new Set(teamInvites));
      }
    } catch (error) {
      console.error('加载邀请记录失败:', error);
    }
  };

  // 保存已邀请用户到存储
  const saveInvitedUsers = async (newInvitedUsers) => {
    try {
      // 先读取现有数据
      const storedData = await getItemFromAsyncStorage(STORAGE_KEY);
      const parsedData = storedData ? storedData : {};
      
      // 更新当前小组的邀请记录
      parsedData[team_id] = Array.from(newInvitedUsers);
      
      // 保存回存储
      await setItemToAsyncStorage(STORAGE_KEY, parsedData);
    } catch (error) {
      console.error('保存邀请记录失败:', error);
    }
  };

  // 添加已邀请用户
  const addInvitedUser = async (userId) => {
    const newSet = new Set(invitedUsers).add(userId);
    setInvitedUsers(newSet);
    await saveInvitedUsers(newSet);
  };

  // 获取用户关注列表
  const { data: followingData, isLoading: isFollowingLoading, refetch } = useQuery({
    queryKey: ['userFollowing', userData?.id, page, size],
    queryFn: async () => {
      const response = await api.get(`${BASE_INFO.BASE_URL}api/users/${userData?.id}/following`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          page,
          size,
        },
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      return response.data;
    },
    enabled: !!userData?.id && !!accessToken,
  });

  // 获取小组信息
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team', team_id],
    queryFn: async () => {
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/teams/${team_id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }
      return response.data;
    },
    enabled: !!team_id && !!accessToken,
  });

  // 邀请好友加入聊天室
  const inviteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/chatrooms/${chatRoom_id}/invitations`,
        {
          user_id: userId,
          description: `邀请您加入小组 ${teamData?.team_name}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      return response.data;
    },
    onSuccess: (data, userId) => {
      addInvitedUser(userId);
      showToast("邀请发送成功", "success");
      refetch();
    },
    onError: (error) => {
      showToast("邀请发送失败", "error");
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const token = await getItemFromAsyncStorage("accessToken");
      const user = await getItemFromAsyncStorage("user");
      setAccessToken(token);
      setUserData(user ? user : null);
      await loadInvitedUsers();
    };
    loadData();
  }, [team_id]);

  // 检查用户是否已经在小组中
  const isUserInTeam = (userId) => {
    return teamData?.chatRoom.members.some(member => member.user_id === userId);
  };

  // 检查用户是否已被邀请
  const isUserInvited = (userId) => {
    return invitedUsers.has(userId);
  };

  // 渲染用户头像
  const renderAvatar = (user) => {
    if (user.avatar_key) {
      return (
        <Image
          source={{ uri: user.avatar_key }}
          className="w-12 h-12 rounded-full"
        />
      );
    }
    return (
      <View className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
        <Text className="text-lg font-medium text-gray-700 dark:text-gray-200">
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  if (isFollowingLoading || isTeamLoading || !accessToken || !userData) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900 px-2" style={{ paddingTop: insets.top }}>
      {/* 小组信息 */}
      <View className="p-5 border-b border-gray-200 dark:border-gray-700 rounded-xl bg-white mt-3">
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">队伍名：</Text>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            {teamData?.team_name}
          </Text>
        </View>
        <Text className="text-sm text-gray-600 dark:text-gray-300">
          队伍描述: {teamData?.description}
        </Text>
        <View className="flex-row items-center mt-2">
          <MaterialIcons name="people" size={16} color="#9ca3af" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
            当前成员: {teamData?.chatRoom.members.length}人
          </Text>
        </View>
      </View>

      {/* 好友列表 */}
      <ScrollView className="flex-1 bg-white rounded-xl my-4 p-1">
        <View className="px-4 py-3 flex-row items-center border-b border-gray-100 dark:border-gray-800">
          <Text className="text-gray-500 dark:text-gray-400 font-medium ml-2">
            我的关注 ({followingData?.totalItems})
          </Text>
        </View>

        {followingData?.items.map((item) => {
          const isInTeam = isUserInTeam(item.following.id);
          const isInvited = isUserInvited(item.following.id);
          
          return (
            <View 
              key={item.follow_id} 
              className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800"
            >
              <View className="flex-row items-center">
                {renderAvatar(item.following)}
                <View className="ml-3">
                  <Text className="text-base font-medium text-gray-900 dark:text-white">
                    {item.following.name}
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={14} color="#9ca3af" />
                    <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      关注于 {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              {isInTeam ? (
                <View className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 flex-row items-center">
                  <MaterialIcons name="check" size={14} color="#4b5563" />
                  <Text className="text-sm text-gray-600 dark:text-gray-300 ml-1">已加入</Text>
                </View>
              ) : isInvited ? (
                <View className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 flex-row items-center">
                  <MaterialIcons name="done-all" size={14} color="#4b5563" />
                  <Text className="text-sm text-green-600 dark:text-green-300 ml-1">已邀请</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 flex-row items-center"
                  onPress={() => inviteMutation.mutate(item.following.id)}
                  disabled={inviteMutation.isLoading}
                >
                  {inviteMutation.isLoading ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <MaterialIcons name="person-add" size={14} color="#3b82f6" />
                  )}
                  <Text className="text-sm text-blue-600 dark:text-blue-300 ml-1">
                    {inviteMutation.isLoading ? '邀请中...' : '邀请'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* 分页控制 */}
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity
            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 flex-row items-center"
            onPress={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            <MaterialIcons name="chevron-left" size={18} color="#4b5563" />
            <Text className="text-gray-700 dark:text-gray-200 ml-1">上一页</Text>
          </TouchableOpacity>
          
          <Text className="text-gray-600 dark:text-gray-300">
            第 {page + 1} 页 / 共 {followingData?.totalPages} 页
          </Text>
          
          <TouchableOpacity
            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 flex-row items-center"
            onPress={() => setPage(page + 1)}
            disabled={page >= (followingData?.totalPages || 1) - 1}
          >
            <Text className="text-gray-700 dark:text-gray-200 mr-1">下一页</Text>
            <MaterialIcons name="chevron-right" size={18} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default InviteFriend