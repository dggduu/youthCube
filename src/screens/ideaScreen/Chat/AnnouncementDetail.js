import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, useColorScheme, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute, useNavigation } from "@react-navigation/native"
import Icon from 'react-native-vector-icons/MaterialIcons'
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage"
import axios from 'axios'
import { BASE_INFO } from '../../../constant/base';
import { GRADES } from "../../../constant/user";
import { useToast } from "../../../components/tip/ToastHooks";
import CustomAlert from "../../../components/custom/CustomAlert";
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";

const api = axios.create();
setupAuthInterceptors(api);

const AnnouncementDetail = () => {
  const colorScheme = useColorScheme();
  const { params } = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [gradeLabel, setGradeLabel] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { teamId, role } = params;
  const isAdmin = role === 'owner' || role === 'co_owner';

  const fetchAnnouncements = async (pageNum = 0, isRefresh = false) => {
    try {
      const response = await api.get(`${BASE_INFO.BASE_URL}api/teams/${teamId}/announcements`, {
        params: { page: pageNum, size: 10 }
      });

      if (isRefresh) {
        setAnnouncements(response.data.items);
      } else {
        setAnnouncements(prev => [...prev, ...response.data.items]);
      }
      
      setHasMore(response.data.totalPages > pageNum + 1);
      setPage(pageNum);
    } catch (error) {
      showToast("加载公告失败", 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTeamData = async () => {
    try {
      const teamResponse = await api.get(`${BASE_INFO.BASE_URL}api/teams/${teamId}`);
      if (teamResponse.data?.grade !== undefined && teamResponse.data?.grade !== null) {
        const foundGrade = GRADES.find(grade => grade.value === teamResponse.data.grade);
        setGradeLabel(foundGrade?.label || '未知');
      }
      setTeamData(teamResponse.data);
    } catch (error) {
      showToast("加载团队信息失败", 'error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getItemFromAsyncStorage("accessToken");
        const userString = await getItemFromAsyncStorage("user");
        setAccessToken(token);
        if (userString) {
          setCurrentUser(userString);
        }

        await Promise.all([fetchAnnouncements(), fetchTeamData()]);
      } catch (error) {
        showToast("加载数据失败", 'error');
      }
    };

    fetchData();
  }, [teamId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchAnnouncements(page + 1);
    }
  };

  const handleDelete = (announcementId) => {
    setAlertConfig({
      visible: true,
      title: '确认删除',
      message: '确定要删除这条公告吗？删除后无法恢复。',
      buttons: [
        {
          text: '取消',
          onPress: () => setAlertConfig({...alertConfig, visible: false}),
          style: 'cancel'
        },
        {
          text: '确认',
          onPress: async () => {
            try {
              await api.delete(`${BASE_INFO.BASE_URL}api/teams/${teamId}/announcements/${announcementId}`);
              showToast('公告已删除', 'success');
              fetchAnnouncements(0, true);
            } catch (error) {
              showToast('删除公告失败', 'error');
            }
          },
          style: 'destructive'
        }
      ]
    });
  };

  const handleTogglePin = async (announcementId) => {
    try {
      await api.patch(`${BASE_INFO.BASE_URL}api/teams/${teamId}/announcements/${announcementId}/pin`);
      showToast('操作成功', 'success');
      fetchAnnouncements(0, true);
    } catch (error) {
      showToast('操作失败', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(
        `${BASE_INFO.BASE_URL}api/teams/${teamId}/announcements/${editingAnnouncement.announcement_id}`,
        { title: editTitle, content: editContent }
      );
      showToast('公告已更新', 'success');
      setIsEditing(false);
      fetchAnnouncements(0, true);
    } catch (error) {
      showToast('更新公告失败', 'error');
    }
  };

  const handleCreate = async () => {
    try {
      await api.post(`${BASE_INFO.BASE_URL}api/teams/${teamId}/announcements`, {
        title: newTitle,
        content: newContent
      });
      showToast('公告已创建', 'success');
      setModalVisible(false);
      setNewTitle('');
      setNewContent('');
      fetchAnnouncements(0, true);
    } catch (error) {
      showToast('创建公告失败', 'error');
    }
  };

  const renderItem = ({ item }) => (
    <View className="mb-4 p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center space-x-2 justify-between">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.title}</Text>
            {item.is_pinned && (
              <View className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full flex-row items-center">
                <Icon name="push-pin" size={14} color={colorScheme === 'dark' ? '#93C5FD' : '#3B82F6'} />
                <Text className="text-xs text-blue-600 dark:text-blue-300 ml-1">置顶</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {item.author?.username} • {item.created_at}
          </Text>
        </View>
      </View>
      
      <Text className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
        {item.content}
      </Text>
      
      {isAdmin && (
        <View className="flex-row justify-end space-x-2">
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => handleTogglePin(item.announcement_id)}
          >
            <Icon 
              name={item.is_pinned ? "push-pin" : "outlined-flag"} 
              size={20} 
              color={colorScheme === 'dark' ? '#93C5FD' : '#3B82F6'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => {
              setEditingAnnouncement(item);
              setEditTitle(item.title);
              setEditContent(item.content);
              setIsEditing(true);
            }}
          >
            <Icon name="edit" size={20} color={colorScheme === 'dark' ? '#A7F3D0' : '#10B981'} />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => handleDelete(item.announcement_id)}
          >
            <Icon name="delete" size={20} color={colorScheme === 'dark' ? '#FCA5A5' : '#EF4444'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore && announcements.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-gray-400 dark:text-gray-500 text-sm">没有更多公告了</Text>
        </View>
      );
    }
    return null;
  };

  if (loading && announcements.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#3B82F6' : '#2563EB'} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Content */}
      <FlatList
        className="px-4 pt-4"
        data={announcements}
        renderItem={renderItem}
        keyExtractor={(item) => item.announcement_id.toString()}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && (
            <View className="flex-1 items-center justify-center py-10">
              <Icon name="info-outline" size={40} color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'} />
              <Text className="mt-3 text-gray-500 dark:text-gray-400">暂无公告</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Create Button */}
      {isAdmin && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 dark:bg-blue-600 rounded-full shadow-lg items-center justify-center"
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-11/12 bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg">
            <Text className="text-xl font-semibold text-gray-800 dark:text-white mb-4">编辑公告</Text>
            
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-2">标题</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-4 text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="输入公告标题"
              style={{height:55}}
              placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
            />
            
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-2">内容</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-md p-3 h-40 text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              value={editContent}
              onChangeText={setEditContent}
              placeholder="输入公告内容"
              multiline
              textAlignVertical="top"
              placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
            />
            
            <View className="flex-row justify-end mt-6 space-x-3">
              <TouchableOpacity
                className="px-5 py-2 rounded-md bg-gray-200 dark:bg-gray-700 items-center"
                onPress={() => setIsEditing(false)}
              >
                <Text className="text-gray-800 dark:text-gray-200">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-5 py-2 rounded-md bg-blue-500 dark:bg-blue-600 items-center ml-2"
                onPress={handleUpdate}
              >
                <Text className="text-white">保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-11/12 bg-white dark:bg-gray-800 rounded-lg p-5 shadow-lg">
            <Text className="text-xl font-semibold text-gray-800 dark:text-white mb-4">新建公告</Text>
            
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-2">标题</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-md p-3 mb-4 text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="输入公告标题"
              style={{height:50}}
              placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
            />
            
            <Text className="text-sm text-gray-600 dark:text-gray-300 mb-2">内容</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-md p-3 h-40 text-gray-800 dark:text-white bg-white dark:bg-gray-700"
              value={newContent}
              onChangeText={setNewContent}
              placeholder="输入公告内容"
              multiline
              textAlignVertical="top"
              placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
            />
            
            <View className="flex-row justify-end mt-6 space-x-3">
              <TouchableOpacity
                className="px-5 py-2 rounded-md bg-gray-200 dark:bg-gray-700 items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-800 dark:text-gray-200">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-5 py-2 rounded-md bg-blue-500 dark:bg-blue-600 items-center ml-2"
                onPress={handleCreate}
              >
                <Text className="text-white">发布</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({...alertConfig, visible: false})}
      />
    </View>
  );
};

export default AnnouncementDetail;