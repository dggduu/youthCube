import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useToast } from "../../../components/tip/ToastHooks";
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_INFO } from '../../../constant/base';
import { GRADES } from '../../../constant/user';
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import WaterfallFlow from 'react-native-waterfall-flow';

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const TeamInvitationSolve = () => {
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [accessToken, setAccessToken] = useState(null);
    const [page, setPage] = useState(0);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
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

    const fetchTeamInvitations = async () => {
        const response = await api.get(
            `${BASE_INFO.BASE_URL}api/invite/team`,
            {
                params: { page, size },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return response.data;
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['teamInvitations', page],
        queryFn: fetchTeamInvitations,
        enabled: !!accessToken,
    });

    const acceptInvitation = async (invitationId) => {
        return api.patch(
            `${BASE_INFO.BASE_URL}api/invite/team/${invitationId}/accept`,
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
            `${BASE_INFO.BASE_URL}api/invite/team/${invitationId}/reject`,
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
            setModalVisible(false);
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
            setModalVisible(false);
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

    const openInvitationDetail = (invitation) => {
        setSelectedInvitation(invitation);
        setModalVisible(true);
    };

    const getGradeLabel = (gradeValue) => {
        const grade = GRADES.find(g => g.value === gradeValue);
        return grade ? grade.label : gradeValue;
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => openInvitationDetail(item)}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.inviter?.name} 邀请你加入 {item.team?.team_name}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        团队类型: {item.team?.is_public ? '公开' : '私有'} · 
                        等级: {getGradeLabel(item.team?.grade)}
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
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
            
            <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    有效时间：{new Date(item.created_at).toLocaleString()} ~ {new Date(item.expires_at).toLocaleString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-4"> 
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
                            numColumns={1}
                            keyExtractor={(item) => item.invitation_id.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    ) : (
                        <Text className="text-gray-500 dark:text-gray-400 text-center py-8">
                            暂无队伍邀请
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

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View className="flex-1 justify-center items-center bg-black/50 p-4">
                            <View className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 max-h-[80%]">
                                <ScrollView>
                                    <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
                                        {selectedInvitation?.inviter?.name} 邀请你加入 {selectedInvitation?.team?.team_name}
                                    </Text>
                                    
                                    <View className="mb-4">
                                        <Text className="text-gray-600 dark:text-gray-400 font-medium mb-1">团队信息</Text>
                                        <View className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                            <Text className="text-gray-800 dark:text-gray-200">
                                                类型: {selectedInvitation?.team?.is_public ? '公开团队' : '私有团队'}
                                            </Text>
                                            <Text className="text-gray-800 dark:text-gray-200 mt-1">
                                                等级: {getGradeLabel(selectedInvitation?.team?.grade)}
                                            </Text>
                                            <Text className="text-gray-800 dark:text-gray-200 mt-1">
                                                创建时间: {new Date(selectedInvitation?.team?.create_at).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View className="mb-4">
                                        <Text className="text-gray-600 dark:text-gray-400 font-medium mb-1">邀请信息</Text>
                                        <View className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                            <Text className="text-gray-800 dark:text-gray-200">
                                                邀请人: {selectedInvitation?.inviter?.name}
                                            </Text>
                                            <Text className="text-gray-800 dark:text-gray-200 mt-1">
                                                联系邮箱: {selectedInvitation?.email}
                                            </Text>
                                            <Text className="text-gray-800 dark:text-gray-200 mt-1">
                                                邀请时间: {new Date(selectedInvitation?.created_at).toLocaleString()}
                                            </Text>
                                            <Text className="text-gray-800 dark:text-gray-200 mt-1">
                                                过期时间: {new Date(selectedInvitation?.expires_at).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {selectedInvitation?.description && (
                                        <View className="mb-4">
                                            <Text className="text-gray-600 dark:text-gray-400 font-medium mb-1">邀请理由</Text>
                                            <View className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                                                <Text className="text-gray-800 dark:text-gray-200">
                                                    {selectedInvitation.description}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                                
                                {selectedInvitation?.status === 'pending' && (
                                    <View className="flex-row justify-end space-x-3 mt-4">
                                        <TouchableOpacity
                                            className="px-4 py-2 bg-red-100 rounded-lg dark:bg-red-900"
                                            onPress={() => handleReject(selectedInvitation.invitation_id)}
                                        >
                                            <Text className="text-red-700 dark:text-red-200 font-medium">
                                                拒绝邀请
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="px-4 py-2 ml-3 bg-green-100 rounded-lg dark:bg-green-900"
                                            onPress={() => handleAccept(selectedInvitation.invitation_id)}
                                        >
                                            <Text className="text-green-700 dark:text-green-200 font-medium">
                                                接受邀请
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                
                                <TouchableOpacity
                                    className="mt-4 px-4 py-2 bg-gray-200 rounded-lg dark:bg-gray-700"
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text className="text-gray-800 dark:text-gray-200 text-center">
                                        关闭
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
};

export default TeamInvitationSolve;