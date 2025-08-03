import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useToast } from "../../../components/tip/ToastHooks";
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_INFO } from '../../../constant/base';
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import WaterfallFlow from 'react-native-waterfall-flow';

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();

const FriendInvitationSolve = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [accessToken, setAccessToken] = useState(null);
    const [page, setPage] = useState(0);
    const size = 20;

    useEffect(() => {
        let isMounted = true;

        const fetchToken = async () => {
            try {
                const token = await getItemFromAsyncStorage("accessToken");
                if (isMounted) {
                    setAccessToken(token);
                }
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        fetchToken();

        return () => {
            isMounted = false;
        };
    }, []);

    const fetchFriendInvitations = async () => {
        const response = await api.get(
            `${BASE_INFO.BASE_URL}api/invite/friend`,
            {
                params: { page, size },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log("data",response.data);
        return response.data;
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['friendInvitations', page],
        queryFn: fetchFriendInvitations,
        enabled: !!accessToken,
    });

    const acceptInvitation = async (invitationId) => {
        return api.patch(
            `${BASE_INFO.BASE_URL}api/invite/friend/${invitationId}/accept`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    };

    const rejectInvitation = async (invitationId) => {
        return api.patch(
            `${BASE_INFO.BASE_URL}api/invite/friend/${invitationId}/reject`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    };

    const { mutateAsync: acceptMutate } = useMutation({
        mutationFn: acceptInvitation,
        onSuccess: () => {
            showToast('接受成功', 'success');
            refetch();
        },
        onError: () => {
            showToast('接受失败', 'error');
        },
    });

    const { mutateAsync: rejectMutate } = useMutation({
        mutationFn: rejectInvitation,
        onSuccess: () => {
            showToast('拒绝成功', 'success');
            refetch();
        },
        onError: () => {
            showToast('拒绝失败', 'error');
        },
    });

    const handlePrevPage = () => setPage(p => Math.max(0, p - 1));
    const handleNextPage = () => setPage(p => p + 1);

    const handleAccept = (invitationId) => {
        acceptMutate(invitationId);
    };

    const handleReject = (invitationId) => {
        rejectMutate(invitationId);
    };

    const renderItem = ({ item }) => (
        <View 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.inviter?.name} 请求添加你的好友
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        联系邮箱: {item.email}
                    </Text>
                </View>
                <Text className={`px-2 py-1 rounded text-sm ${
                    item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : item.status === 'accepted'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : item.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : item.status === 'expired'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                    {item.status === 'pending'
                        ? '待处理'
                        : item.status === 'accepted'
                        ? '已接受'
                        : item.status === 'rejected'
                        ? '已拒绝'
                        : item.status === 'expired'
                        ? '已过期'
                        : '未知状态'}
                </Text>
            </View>
            
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
                邀请时间: {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
                过期时间: {new Date(item.expires_at).toLocaleString()}
            </Text>
            
            {item.status === 'pending' && (
                <View className="flex-row justify-end space-x-2 mt-3">
                    <TouchableOpacity
                        className="px-4 py-2 bg-red-100 rounded-lg dark:bg-red-900 mr-3"
                        onPress={() => handleReject(item.invitation_id)}
                    >
                        <Text className="text-red-700 dark:text-red-200 font-medium">
                            拒绝
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="px-4 py-2 bg-green-100 rounded-lg dark:bg-green-900"
                        onPress={() => handleAccept(item.invitation_id)}
                    >
                        <Text className="text-green-700 dark:text-green-200 font-medium">
                            同意
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-4"> 
            {isLoading ? (
                <ActivityIndicator className="my-4" size="large" />
            ) : isError ? (
                <Text className="text-red-500 dark:text-red-400">加载失败，请重试</Text>
            ) : (
                <>
                    {data?.items?.length > 0 ? (
                        <WaterfallFlow
                            data={data.items}
                            renderItem={renderItem}
                            numColumns={1} // Single column layout
                            keyExtractor={(item) => item.invitation_id.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    ) : (
                        <Text className="text-gray-500 dark:text-gray-400 text-center py-8">
                            暂无好友邀请
                        </Text>
                    )}

                    {data?.totalPages > 1 && (
                        <View className="flex-row justify-between items-center mt-4">
                            <TouchableOpacity
                                className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-700"
                                onPress={handlePrevPage}
                                disabled={page === 0}
                            >
                                <Text className="text-gray-800 dark:text-gray-200">上一页</Text>
                            </TouchableOpacity>
                            
                            <Text className="text-gray-700 dark:text-gray-300">
                                第 {page + 1} 页 / 共 {data.totalPages} 页
                            </Text>
                            
                            <TouchableOpacity
                                className="px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-700"
                                onPress={handleNextPage}
                                disabled={page >= data.totalPages - 1}
                            >
                                <Text className="text-gray-800 dark:text-gray-200">下一页</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

export default FriendInvitationSolve;