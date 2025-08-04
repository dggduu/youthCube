import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
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

                await setItemToAsyncStorage("user", response.data);
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

        init();
    }, []);

    useEffect(() => {
        setPrivateChats(filterFollowing ? allPrivateChats.filter(chat => chat.other_user.is_following) : allPrivateChats);
    }, [filterFollowing]);

    const renderPrivateChat = ({ item }) => (
        <TouchableOpacity
            className={`p-4 mb-3 rounded-lg shadow-sm 
                ${item.other_user.is_following 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('single', { chatId: item.room_id, name: item.other_user.name })}
        >
            <View className="flex-row items-center">
                <View className={`p-2 rounded-full mr-3 ${item.other_user.is_following ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <MaterialIcons
                        name={item.other_user.is_following ? 'favorite' : 'person'}
                        size={20}
                        color={item.other_user.is_following ? '#409eff' : '#909399'}
                    />
                </View>
                <View className="flex-1">
                    <View className="flex-row justify-between items-center">
                        <Text
                            numberOfLines={1}
                            className={`text-base font-medium 
                                ${item.other_user.is_following 
                                    ? 'text-blue-600 dark:text-blue-300' 
                                    : 'text-gray-800 dark:text-gray-200'
                                }`}
                        >
                            {item.other_user.name}
                        </Text>
                        {item.unreadCount > 0 && (
                            <View className="bg-red-500 rounded-full w-5 h-5 justify-center items-center">
                                <Text className="text-white text-xs">{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-gray-500 text-sm mt-1 dark:text-gray-400">
                        {item.last_message || '暂无消息'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header Buttons */}
            <View className="flex-row p-4 space-x-3">
                <TouchableOpacity
                    className="flex-1 items-center justify-center p-3 rounded-l-lg 
                        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                        shadow-sm active:bg-gray-100 dark:active:bg-gray-700"
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("FriendInvite")}
                >
                    <View className="flex-row items-center">
                        <MaterialIcons name="person-add" size={18} color="#409eff" />
                        <Text className="ml-2 text-gray-800 dark:text-gray-200">新朋友</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 items-center justify-center p-3 rounded-r-lg 
                        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                        shadow-sm active:bg-gray-100 dark:active:bg-gray-700"
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("TeamInvite")}
                >
                    <View className="flex-row items-center">
                        <MaterialIcons name="notifications" size={18} color="#e6a23c" />
                        <Text className="ml-2 text-gray-800 dark:text-gray-200">群通知</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Team Chat Section */}
            {teamChat && (
                <View className="px-4 mb-4">
                    <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">团队聊天</Text>
                    <TouchableOpacity
                        className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                            shadow-sm active:bg-gray-50 dark:active:bg-gray-700/50"
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('group', { 
                            chatId: teamChat.chatRoomId, 
                            team_id: teamChat.teamId, 
                            name: teamChat.name 
                        })}
                    >
                        <View className="flex-row items-center">
                            <View className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-3">
                                <MaterialIcons name="groups" size={22} color="#409eff" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {teamChat.name}
                                </Text>
                                <Text className="text-gray-500 text-sm mt-1 dark:text-gray-400">
                                    团队 ID: {teamChat.teamId}
                                </Text>
                            </View>
                            <MaterialIcons 
                                name="chevron-right" 
                                size={24} 
                                color="#c0c4cc" 
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Private Chats Section */}
            <View className="flex-1 px-4">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">私聊列表</Text>
                    <TouchableOpacity
                        className={`px-3 py-1.5 rounded-full flex-row items-center 
                            ${filterFollowing 
                                ? 'bg-blue-100 dark:bg-blue-900/30' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                        activeOpacity={0.7}
                        onPress={() => setFilterFollowing(!filterFollowing)}
                    >
                        <MaterialIcons
                            name={filterFollowing ? 'filter-alt' : 'filter-list'}
                            size={16}
                            color={filterFollowing ? '#409eff' : '#909399'}
                        />
                        <Text className={`ml-1 text-sm 
                            ${filterFollowing 
                                ? 'text-blue-600 dark:text-blue-300' 
                                : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {filterFollowing ? '仅关注' : '筛选'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading && page === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#409eff" />
                    </View>
                ) : (
                    <FlatList
                        data={privateChats}
                        renderItem={renderPrivateChat}
                        keyExtractor={(item) => item.room_id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        onEndReached={() => !loading && hasMore && fetchPrivateChats(page + 1)}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={() =>
                            loading && page > 0 ? (
                                <View className="py-4">
                                    <ActivityIndicator size="small" color="#409eff" />
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={() => (
                            <View className="py-10 items-center justify-center">
                                <MaterialIcons 
                                    name={privateChatError?.includes('失败') ? 'error-outline' : 'chat'} 
                                    size={40} 
                                    color={privateChatError?.includes('失败') ? '#f56c6c' : '#c0c4cc'} 
                                />
                                <Text className={`mt-3 text-lg 
                                    ${privateChatError?.includes('失败') 
                                        ? 'text-red-500' 
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {privateChatError || (filterFollowing ? '暂无关注的私聊记录' : '暂无私聊记录')}
                                </Text>
                                {privateChatError?.includes('失败') && (
                                    <TouchableOpacity 
                                        onPress={() => fetchPrivateChats(0)}
                                        className="mt-4 px-6 py-2 bg-blue-500 rounded-lg 
                                            active:bg-blue-600"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-white">重新加载</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

export default ChatSection;