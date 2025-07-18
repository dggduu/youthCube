import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from "@react-navigation/native";
import { useToast } from "../../../components/tip/ToastHooks";
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_INFO } from '../../../constant/base';
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const InviteRedux = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { showToast } = useToast();
    const { room_id } = route.params;
    const [accessToken, setAccessToken] = useState(null);
    const [page, setPage] = useState(0);
    const size = 5;

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

    const fetchInvitations = async () => {
        const response = await axios.get(
            `${BASE_INFO.BASE_URL}api/chatrooms/${room_id}/invitations`,
            {
                params: { page, size },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log("data:",response.data);
        return response.data;
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['invitations', room_id, page],
        queryFn: fetchInvitations,
    });

    const { mutateAsync } = useMutation({
        mutationFn: async ({ invitationId, action }) => {
            return api.put(
                `${BASE_INFO.BASE_URL}api/chatrooms/${room_id}/invitations/${invitationId}/respond`,
                { action },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
        },
        onSuccess: () => {
            showToast('操作成功', 'success');
            refetch();
        },
        onError: () => {
            showToast('操作失败', 'error');
        },
    });

    const handlePrevPage = () => setPage(p => Math.max(0, p - 1));
    const handleNextPage = () => setPage(p => p + 1);

    const handleRespondToInvitation = ({ invitationId, action }) => {
        mutateAsync({ invitationId, action });
    };

    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-4"> 
            {isLoading ? (
                <ActivityIndicator className="my-4" size="large" />
            ) : isError ? (
                <Text className="text-red-500 dark:text-red-400">加载失败，请重试</Text>
            ) : (
                <>
                    <ScrollView className="mb-4">
                        {data?.items?.length > 0 ? (
                            data.items.map((invitation) => (
                                <View 
                                    key={invitation.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm"
                                >
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View>
                                            <Text className="font-semibold text-gray-800 dark:text-gray-200">
                                                申请人: {invitation.invitee?.name}
                                            </Text>
                                            <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                邀请人: {invitation.invited_by?.name}
                                            </Text>
                                        </View>
                                            <Text className={`px-2 py-1 rounded text-sm ${
                                                invitation.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : invitation.status === 'accepted'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : invitation.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    : invitation.status === 'expired'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {invitation.status === 'pending'
                                                    ? '待处理'
                                                    : invitation.status === 'accepted'
                                                    ? '已接受'
                                                    : invitation.status === 'rejected'
                                                    ? '已拒绝'
                                                    : invitation.status === 'expired'
                                                    ? '已过期'
                                                    : '未知状态'}
                                            </Text>
                                    </View>
                                    
                                    {invitation.description && (
                                        <Text className="text-gray-700 dark:text-gray-300 mb-2 text-sm">
                                            {invitation.description}
                                        </Text>
                                    )}
                                    
                                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                        申请时间: {new Date(invitation.created_at).toLocaleString()}
                                    </Text>
                                    
                                    {invitation.status === 'pending' && (
                                        <View className="flex-row justify-end space-x-2">
                                            <TouchableOpacity
                                                className="px-4 py-2 bg-red-100 rounded-lg dark:bg-red-900 mr-3"
                                                onPress={() => handleRespondToInvitation({
                                                    invitationId: invitation.id,
                                                    action: 'reject'
                                                })}
                                            >
                                                <Text className="text-red-700 dark:text-red-200 font-medium">
                                                    拒绝
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                className="px-4 py-2 bg-green-100 rounded-lg dark:bg-green-900"
                                                onPress={() => handleRespondToInvitation({
                                                    invitationId: invitation.id,
                                                    action: 'accept'
                                                })}
                                            >
                                                <Text className="text-green-700 dark:text-green-200 font-medium">
                                                    同意
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-500 dark:text-gray-400 text-center py-8">
                                暂无待处理的入群申请
                            </Text>
                        )}
                    </ScrollView>

                    {data?.totalPages > 1 && (
                        <View className="flex-row justify-between items-center">
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

export default InviteRedux;