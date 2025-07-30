import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { getItemFromAsyncStorage, setItemToAsyncStorage } from '../../../utils';
import { BASE_INFO } from '../../../constant/base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useToast } from '../../../components/tip/ToastHooks';
import axios from "axios";

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const ChatSection = () => {
    const [teamChat, setTeamChat] = useState(null);
    const [privateChats, setPrivateChats] = useState([]);
    const [allPrivateChats, setAllPrivateChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [filterFollowing, setFilterFollowing] = useState(false);
    const [privateChatError, setPrivateChatError] = useState(null);

    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const showToast = useToast();

    useEffect(() => {
        const fetchUserData = async () => {
        try {
            const userString = await getItemFromAsyncStorage("user");
            if (!userString) {
            setLoading(false);
            return;
            }

            const userObj = userString;
            const userId = userObj.id;

            const response = await axios.get(
            `${BASE_INFO.BASE_URL}api/users/${userId}`,
            {
                headers: {
                'Authorization': `Bearer ${await getItemFromAsyncStorage("accessToken")}`
                }
            }
            );

            await setItemToAsyncStorage("user",response.data);

            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
        };

        fetchUserData();
    }, []);
    const fetchTeamChat = async (teamId) => {
        try {
            const accessToken = await getItemFromAsyncStorage('accessToken');
            const response = await api.get(`${BASE_INFO.BASE_URL}api/chatrooms/team/${teamId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = response.data;

            if (data.message === "未找到该团队的聊天室") {
                setTeamChat(null);
                return;
            }

            setTeamChat(data);
        } catch (error) {
            console.error('Error fetching team chat:', error);
            setTeamChat(null);
        }
    };

   const fetchPrivateChats = async (pageNum = 0) => {
        if (!hasMore && pageNum !== 0) return;

        try {
            if (pageNum === 0) {
                setLoading(true);
                setPrivateChatError(null);
            }

            const accessToken = await getItemFromAsyncStorage('accessToken');
            const url = `${BASE_INFO.BASE_URL}api/chatrooms/private`;

            const response = await api.get(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    page: pageNum,
                    size: 10
                }
            });

            const data = response.data;

            const newChats = Array.isArray(data.items) ? data.items : [];

            if (newChats.length === 0 && pageNum === 0) {
                // 这里修改为只设置状态，不显示toast
                setPrivateChatError(filterFollowing ? '暂无关注的私聊记录' : '暂无私聊记录');
            } else if (newChats.length === 0 && pageNum > 0) {
                setHasMore(false);
            }

            setAllPrivateChats(prev => pageNum === 0 ? [...newChats] : [...prev, ...newChats]);
            const filteredChats = filterFollowing
                ? newChats.filter(chat => chat.is_following)
                : newChats;

            setPrivateChats(prev => pageNum === 0 ? [...filteredChats] : [...prev, ...filteredChats]);

            setHasMore(pageNum < data.totalPages - 1);
            setPage(pageNum);

        } catch (error) {
            console.error('Error fetching private chats:', error);
            if (pageNum === 0) {
                if (error.response) {
                    if (error.response.status === 404) {
                        setPrivateChatError(filterFollowing ? '暂无关注的私聊记录' : '暂无私聊记录');
                    } else {
                        setPrivateChatError('加载私聊列表失败，请稍后再试');
                        showToast('error', '加载私聊列表失败，请稍后再试');
                    }
                } else if (error.request) {
                    setPrivateChatError('网络连接失败，请检查网络');
                    showToast('error', '网络连接失败，请检查网络');
                } else {
                    setPrivateChatError('加载私聊列表失败');
                    showToast('error', '加载私聊列表失败');
                }
                
                setPrivateChats([]);
                setAllPrivateChats([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const user = await getItemFromAsyncStorage("user");
                if (user?.team_id) await fetchTeamChat(user.team_id);
                await fetchPrivateChats(0);
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };

        if (isFocused) init();
    }, [isFocused]);

    useEffect(() => {
        setPrivateChats(filterFollowing ? allPrivateChats.filter(chat => chat.other_user.is_following) : allPrivateChats);
    }, [filterFollowing]);

    const renderPrivateChat = ({ item }) => (
        <TouchableOpacity
            className={`p-4 border border-gray-300 dark:border-gray-600 rounded-xl flex-row items-center ${item.other_user.is_following ? 'bg-blue-50 dark:bg-blue-900' : 'bg-transparent'}`}
            onPress={() => navigation.navigate('single', { chatId: item.room_id, name:item.other_user.name })}
        >
            <MaterialIcons
                name={item.other_user.is_following ? 'favorite' : 'person'}
                size={20}
                color={item.other_user.is_following ? '#4B77D1' : '#666'}
            />
            <View className="flex-1 ml-2">
                <Text className={`text-base ${item.other_user.is_following ? 'text-blue-600 font-bold dark:text-blue-100' : 'text-black dark:text-gray-300'}`}>
                    {item.other_user.name}
                </Text>
                <Text className="text-gray-500 text-xs dark:text-gray-300">
                    最近消息: {item.last_message || '暂无消息'}
                </Text>
            </View>
            {item.unreadCount > 0 && (
                <View className="bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                    <Text className="text-white text-xs dark:text-gray-300">{item.unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className='px-4 mt-3'>
                <TouchableOpacity
                    onPress={()=>{
                        navigation.navigate("FriendInvite");
                    }}
                    className='items-center rounded-lg justify-center p-3 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                >
                    <Text className='dark:text-white'>新朋友</Text>
                </TouchableOpacity>
                <TouchableOpacity
                className='items-center rounded-lg justify-center p-3 mt-3 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                    onPress={()=>{
                        navigation.navigate("TeamInvite");
                    }}
                >
                    <Text className='dark:text-white'>群通知</Text>
                </TouchableOpacity>
            </View>

            {/* 团队聊天 */}
            {teamChat && (
                <View className="p-4">
                    <Text className="font-bold mb-2 dark:text-gray-200">团队聊天</Text>
                    <TouchableOpacity
                        className="p-4 bg-blue-50 rounded-lg flex-row items-center dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                        onPress={() => navigation.navigate('group', { chatId: teamChat.chatRoomId, team_id:teamChat.teamId, name:teamChat.name })}
                    >
                        <MaterialIcons name="groups" size={24} color="#1976d2" />
                        <View className="flex-1 ml-2">
                            <Text className="text-base font-bold dark:text-gray-300">{teamChat.name}</Text>
                            <Text className="text-gray-500 text-xs dark:text-gray-300">团队 ID: {teamChat.teamId}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            )}

            {/* 私聊列表 */}
            <View className="p-4 flex-1 mb-10">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold dark:text-gray-200">私聊列表</Text>
                    <TouchableOpacity
                        className={`px-2 py-1 flex-row items-center rounded-full ${filterFollowing ? 'bg-blue-50' : 'bg-transparent'}`}
                        onPress={() => setFilterFollowing(!filterFollowing)}
                    >
                        <MaterialIcons
                            name={filterFollowing ? 'filter-alt' : 'filter-list'}
                            size={18}
                            color={filterFollowing ? '#1976d2' : '#666'}
                        />
                        <Text className={`ml-1 text-xs ${filterFollowing ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-200'}`}>
                            {filterFollowing ? '仅显示关注' : '筛选'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && page === 0 ? (
                    <ActivityIndicator size="large" className="mt-5" />
                ) : (
                    <FlatList
                        data={privateChats}
                        renderItem={renderPrivateChat}
                        keyExtractor={(item) => item.room_id}
                        onEndReached={() => !loading && hasMore && fetchPrivateChats(page + 1)}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={() =>
                            loading && page > 0 ? <ActivityIndicator size="small" /> : null
                        }
                        ListEmptyComponent={() => (
                            <View className="py-4 items-center">
                                <MaterialIcons 
                                    name={privateChatError?.includes('失败') ? 'error-outline' : 'chat'} 
                                    size={24} 
                                    color={privateChatError?.includes('失败') ? '#ef4444' : '#9ca3af'} 
                                />
                                <Text className={`mt-2 ${privateChatError?.includes('失败') ? 'text-red-500' : 'text-gray-500'}`}>
                                    {privateChatError || (filterFollowing ? '暂无关注的私聊记录' : '暂无私聊记录')}
                                </Text>
                                {privateChatError?.includes('失败') && (
                                    <TouchableOpacity 
                                        onPress={() => fetchPrivateChats(0)}
                                        className="mt-2 px-4 py-2 bg-blue-500 rounded-lg"
                                    >
                                        <Text className="text-white">重新加载</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        className="flex-1"
                    />
                )}
            </View>
        </View>
    );
};

export default ChatSection;