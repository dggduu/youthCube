import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useToast } from '../../../components/tip/ToastHooks';
import { getItemFromAsyncStorage } from '../../../utils/LocalStorage';
import { BASE_INFO } from '../../../constant/base';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from "@react-native-vector-icons/material-icons";

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const InviteToTeam = () => {
  const route = useRoute();
  const { team_id } = route.params || {};
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const { showToast } = useToast();
  
  const [team, setTeam] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getItemFromAsyncStorage('user');
        const token = await getItemFromAsyncStorage('accessToken');
        if (!user || !token) return;
        
        setAccessToken(token);
        setEmail(user.email);
        setUserId(user.id);
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (accessToken && userId) {
      fetchTeamInfo();
      fetchFollowers(0);
    }
  }, [accessToken, userId]);

  const fetchTeamInfo = async () => {
    try {
      const res = await api.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setTeam(res.data);
    } catch (error) {
      showToast('获取队伍信息失败', 'error');
    }
  };

  const fetchFollowers = async (pageNum) => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const res = await api.get(`${BASE_INFO.BASE_URL}api/users/${userId}/followers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page: pageNum, size: 20 },
      });

      const newFollowers = Array.isArray(res.data?.items) ? res.data.items : [];
      setFollowers(prev => pageNum === 0 ? newFollowers : [...prev, ...newFollowers]);
      setHasMore(pageNum < (res.data?.totalPages || 0) - 1);
      setPage(pageNum);
      setLoading(false);
    } catch (error) {
      console.error('获取关注者失败:', error);
      showToast('获取关注者列表失败', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchFollowers(page + 1);
    }
  };

  const handleInvite = async (item) => {
    const user_id = item.follower?.id || item.follower_id;
    if (!user_id) return;

    if (invitedUsers.has(user_id)) {
      showToast('已发送过邀请', 'info');
      return;
    }

    try {
      await api.post(
        `${BASE_INFO.BASE_URL}api/invite/team`,
        {
          team_id,
          user_id,
          email: email,
          description: `邀请加入小组 ${team?.team_name || ''}`
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      setInvitedUsers(prev => new Set([...prev, user_id]));
      showToast('邀请发送成功', 'success');
    } catch (error) {
      console.error('邀请失败:', error);
      showToast('邀请发送失败', 'error');
    }
  };

  const renderHeader = () => {
    if (!team) return null;

    return (
      <View>
        <View className={`p-4 mb-4 rounded-lg ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
          <Text className={`text-xl font-bold mb-2 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
            邀请好友加入：{team.team_name}
          </Text>
          <Text className={`text-base ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            描述：{team.description || '暂无描述'}
          </Text>
          <Text className={`text-base mt-1 ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            公开状态：{team.is_public ? '公开加入' : '仅邀请'}
          </Text>
        </View>
        <TouchableOpacity
          className='bg-[#409eff] py-4 rounded-lg items-center mb-2'
          onPress={() => navigation.navigate("Upload", { teamId:team_id })}
        >
          <Text className='text-white text-lg font-bold'>下一步</Text>
        </TouchableOpacity>
        <Text className='text-sm mb-4 mt-2'>注：后面也可以单独添加</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const follower = item.follower || item;
    const followerId = follower.id || item.follower_id;
    const isInvited = invitedUsers.has(followerId);

    return (
      <View className={`p-3 mb-3 rounded-lg ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700 shadow-sm`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require("../../../assets/logo/ava.png")}
              className="w-10 h-10 rounded-full"
            />
            <Text className={`ml-3 text-base ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
              {follower.name || '未知用户'}
            </Text>
          </View>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${isInvited ? 'bg-gray-300' : 'bg-[#409eff]'}`}
            onPress={() => handleInvite(item)}
            disabled={isInvited}
          >
            <Text className="text-white">
              {isInvited ? '已邀请' : '邀请'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50 dark:bg-gray-900'>
        {/* 帮助AI */}
        <TouchableOpacity
          onPress={()=>{
            navigation.navigate("AI");
          }}
          style={{zIndex:1}}
          className='h-14 w-14 bg-green-600 rounded-full absolute bottom-6 right-6 items-center justify-center'
        >
          <Icon name="help" size={20} color="#fff"/>
        </TouchableOpacity>
      <FlatList
        data={followers}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item) => (item.follower?.id || item.follower_id || Math.random()).toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={() => {
          if (loadingMore) {
            return <ActivityIndicator className="my-4" />;
          }
          if (!hasMore && followers.length > 0) {
            return <Text className={`text-center mt-4 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>没有更多关注者了</Text>;
          }
          if (!followers.length && !loadingMore) {
            return <Text className={`text-center mt-4 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>暂无关注者</Text>;
          }
          return null;
        }}
      />
    </View>
  );
};

export default InviteToTeam;