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

  const loadInvitedUsers = async () => {
    try {
      const storedData = await getItemFromAsyncStorage(STORAGE_KEY);
      if (storedData) {
        const parsedData = storedData;
        const teamInvites = parsedData[team_id] || [];
        setInvitedUsers(new Set(teamInvites));
      }
    } catch (error) {
      console.error('加载邀请记录失败:', error);
    }
  };

  const saveInvitedUsers = async (newInvitedUsers) => {
    try {
      const storedData = await getItemFromAsyncStorage(STORAGE_KEY);
      const parsedData = storedData ? storedData : {};
      parsedData[team_id] = Array.from(newInvitedUsers);
      await setItemToAsyncStorage(STORAGE_KEY, parsedData);
    } catch (error) {
      console.error('保存邀请记录失败:', error);
    }
  };

  const addInvitedUser = async (userId) => {
    const newSet = new Set(invitedUsers).add(userId);
    setInvitedUsers(newSet);
    await saveInvitedUsers(newSet);
  };

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
      return response.data;
    },
    enabled: !!userData?.id && !!accessToken,
  });

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
      return response.data;
    },
    enabled: !!team_id && !!accessToken,
  });

  const inviteMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/chatrooms/${chatRoom_id}/invitations`,
        {
          user_id: userId,
          description: `邀请加入小组 ${teamData?.team_name}`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
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

  const isUserInTeam = (userId) => {
    return teamData?.chatRoom.members.some(member => member.user_id === userId);
  };

  const isUserInvited = (userId) => {
    return invitedUsers.has(userId);
  };

  const renderAvatar = (user) => {
    if (user.avatar_key) {
      return (
        <Image
          source={{ uri: user.avatar_key }}
          className="w-10 h-10 rounded-full"
        />
      );
    }
    return (
      <View className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <Text className="text-lg font-medium text-gray-500">
          {user.name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  if (isFollowingLoading || isTeamLoading || !accessToken || !userData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#409eff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* 顶部卡片*/}
      <View className="mx-4 mt-4 p-4 bg-white rounded-lg shadow-sm">
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-semibold text-gray-800">队伍信息</Text>
        </View>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500 w-20">队伍名称</Text>
            <Text className="text-sm text-gray-800 flex-1">{teamData?.team_name}</Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-sm text-gray-500 w-20">队伍描述</Text>
            <Text className="text-sm text-gray-800 flex-1">{teamData?.description || '暂无描述'}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-500 w-20">成员数量</Text>
            <Text className="text-sm text-gray-800 flex-1">{teamData?.chatRoom.members.length}人</Text>
          </View>
        </View>
      </View>

      {/* 好友列表 */}
      <View className="mx-4 mt-4 bg-white rounded-lg shadow-sm flex-1">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-base font-semibold text-gray-800">
            我的关注 ({followingData?.totalItems || 0})
          </Text>
        </View>
        
        <ScrollView className="flex-1">
          {followingData?.items?.length > 0 ? (
            followingData.items.map((item) => {
              const isInTeam = isUserInTeam(item.following.id);
              const isInvited = isUserInvited(item.following.id);
              
              return (
                <View 
                  key={item.follow_id} 
                  className="p-3 flex-row items-center border-b border-gray-100"
                >
                  {renderAvatar(item.following)}
                  
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-medium text-gray-800">
                      {item.following.name}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                      关注于 {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {isInTeam ? (
                    <View className="px-3 py-1 rounded-full bg-gray-100 flex-row items-center">
                      <MaterialIcons name="check" size={14} color="#67c23a" />
                      <Text className="text-xs text-gray-600 ml-1">已加入</Text>
                    </View>
                  ) : isInvited ? (
                    <View className="px-3 py-1 rounded-full bg-green-100 flex-row items-center">
                      <MaterialIcons name="done-all" size={14} color="#67c23a" />
                      <Text className="text-xs text-green-600 ml-1">已邀请</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      className="px-3 py-1 rounded-full bg-blue-100 flex-row items-center"
                      onPress={() => inviteMutation.mutate(item.following.id)}
                      disabled={inviteMutation.isLoading}
                    >
                      {inviteMutation.isLoading ? (
                        <ActivityIndicator size="small" color="#409eff" />
                      ) : (
                        <MaterialIcons name="person-add" size={14} color="#409eff" />
                      )}
                      <Text className="text-xs text-blue-500 ml-1">
                        {inviteMutation.isLoading ? '邀请中...' : '邀请'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <View className="p-8 items-center justify-center">
              <MaterialIcons name="people-outline" size={48} color="#c0c4cc" />
              <Text className="text-sm text-gray-400 mt-2">暂无关注的好友</Text>
            </View>
          )}
        </ScrollView>

        {/* 分页控制 */}
        {followingData?.totalPages > 1 && (
          <View className="p-3 flex-row items-center justify-between border-t border-gray-100">
            <TouchableOpacity
              className={`px-3 py-1 rounded ${page === 0 ? 'opacity-50' : ''}`}
              onPress={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <Text className={`text-sm ${page === 0 ? 'text-gray-400' : 'text-gray-600'}`}>上一页</Text>
            </TouchableOpacity>
            
            <View className="flex-row items-center space-x-2">
              {Array.from({ length: Math.min(5, followingData.totalPages) }, (_, i) => {
                let pageNum;
                if (followingData.totalPages <= 5) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > followingData.totalPages - 4) {
                  pageNum = followingData.totalPages - 5 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <TouchableOpacity
                    key={pageNum}
                    className={`w-8 h-8 rounded-full items-center justify-center ${page === pageNum ? 'bg-blue-100' : ''}`}
                    onPress={() => setPage(pageNum)}
                  >
                    <Text className={`text-sm ${page === pageNum ? 'text-blue-500 font-medium' : 'text-gray-600'}`}>
                      {pageNum + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity
              className={`px-3 py-1 rounded ${page >= (followingData.totalPages - 1) ? 'opacity-50' : ''}`}
              onPress={() => setPage(page + 1)}
              disabled={page >= (followingData.totalPages - 1)}
            >
              <Text className={`text-sm ${page >= (followingData.totalPages - 1) ? 'text-gray-400' : 'text-gray-600'}`}>下一页</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

export default InviteFriend;