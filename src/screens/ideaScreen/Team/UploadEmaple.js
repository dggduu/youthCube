import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  FlatList,
  Platform
} from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { getItemFromAsyncStorage } from '../../../utils/LocalStorage';
import { BASE_INFO } from '../../../constant/base';
import { useToast } from '../../../components/tip/ToastHooks';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MarkdownInput from '../../../components/MarkdownInput';
import InputBox from "../../../components/inputBox/inputBox";
import Markdown from "react-native-marked";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import setupAuthInterceptors from '../../../utils/axios/AuthInterceptors';
import { example } from '../../../assets/ProgressExmaple/ProgressEmaple';
import CustomAlert from "../../../components/custom/CustomAlert";

const api = axios.create();
setupAuthInterceptors(api);

const ProgressCard = ({ progress, onEdit, onDelete}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const formattedEventTime = new Date(progress.event_time).toLocaleString();
  const timelineTypeMap = {
    meeting: '会议',
    deadline: '截止日期',
    competition: '比赛',
    progress_report: '进度报告'
  };

  return (
    <View className={`border ${borderColor} rounded-lg p-4 mb-4 shadow-md ${cardBg}`}>
      <Text className={`text-lg font-bold mb-2 ${textColor}`}>{progress.title || '无标题'}</Text>
      <Text className={`text-sm mb-2 ${subTextColor}`}>类型: {timelineTypeMap[progress.timeline_type] || progress.timeline_type}</Text>
      <Text className={`text-sm mb-2 ${subTextColor}`}>状态: {
        progress.status === 'pending' ? '待处理' : progress.status === 'accept' ? '已通过' : '已拒绝'
      }</Text>
      <Text className={`text-sm mb-2 ${subTextColor}`}>事件时间: {formattedEventTime}</Text>
      <Text className={`text-sm mb-4 ${subTextColor}`}>提交人: {progress.submitter?.name || '未知'}</Text>
      <Markdown value={progress.content} />
      <View className="flex-row justify-end mt-4">
        <TouchableOpacity
          className="bg-[#409eff] py-2 px-3 rounded-md mr-2"
          onPress={() => onEdit(progress)}
        >
          <Text className="text-white text-sm">编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 py-2 px-3 rounded-md"
          onPress={() => onDelete(progress.progress_id)}
        >
          <Text className="text-white text-sm">删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const UploadExample = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { colorScheme } = useColorScheme();
  const isFocused = useIsFocused();
  const { index } = route.params;

  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const [progressList, setProgressList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  
  // 新增isEditing状态，用于区分创建和编辑模式
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTimelineType, setEditTimelineType] = useState('progress_report');
  const [editEventTime, setEditEventTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 新增CustomAlert相关状态
  const [ClearAlertVisible, setClearAlertVisible] = useState(false);
  const [deleteProgressId, setDeleteProgressId] = useState(null);
  const [ClearAllAlertVisible, setClearAllAlertVisible] = useState(false);

  const ALLOWED_TIMELINE_TYPES = ['meeting', 'deadline', 'competition', 'progress_report'];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = await getItemFromAsyncStorage("accessToken");
        const user = await getItemFromAsyncStorage("user");

        if (!token || !user || !user.team_id) {
          throw new Error('用户未登录或团队信息缺失');
        }

        setAuthToken(token);
        setUserData(user);

        if (!example || !example[index]) {
          throw new Error('无效的模板索引');
        }

        createProgressFromTemplate(example[index].content, user.team_id, token);

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, [index]);

  const createProgressFromTemplate = async (contents, teamId, token) => {
    setIsCreating(true);
    try {
      const createPromises = contents.map(contentItem => {
        const progressData = {
          title: contentItem.title,
          description: contentItem.content.trim(),
          timeline_type: contentItem.type,
          event_time: new Date().toISOString(),
        };
        return api.post(
          `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
          progressData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      });

      await Promise.all(createPromises);
      showToast('所有进度报告已从模板创建成功', 'success');
      fetchProgressList(true);
    } catch (err) {
      let errorMessage = '批量创建进度失败';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      }
      showToast(`创建失败: ${errorMessage}`, 'error');
      setError(errorMessage);
    } finally {
      setIsCreating(false);
      setLoading(false);
    }
  };

  const fetchProgressList = useCallback(async (reset = false) => {
    if (!authToken || !userData?.team_id) return;
    setLoadingList(true);
    try {
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/team/${userData.team_id}/progress`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          params: {
            page: 0,
            size: 10
          }
        }
      );
      setProgressList(response.data.items);
    } catch (err) {
      showToast(`获取列表失败: ${err.message}`, "error");
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, [authToken, userData, showToast]);

  const handleSaveProgress = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      showToast("标题和内容不能为空", "warning");
      return;
    }

    const progressData = {
      title: editTitle,
      description: editDescription,
      timeline_type: editTimelineType,
      event_time: editEventTime.toISOString(),
    };

    try {
      setIsCreating(true);
      if (isEditing) {
        await api.put(
          `${BASE_INFO.BASE_URL}api/progress/${currentProgress.progress_id}`,
          progressData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        showToast("进度更新成功", "success");
      } else {
        await api.post(
          `${BASE_INFO.BASE_URL}api/team/${userData.team_id}/progress`,
          progressData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        showToast("进度创建成功", "success");
      }
      
      closeProgressModal();
      fetchProgressList(true);
    } catch (err) {
      showToast(`${isEditing ? '更新' : '创建'}失败`, "error");
    } finally {
      setIsCreating(false);
    }
  };


  const handleDeleteProgress = async (progressId) => {
    setDeleteProgressId(progressId);
    setClearAlertVisible(true);
  };
  
  const confirmDelete = async () => {
    if (!deleteProgressId) return;
    try {
      await api.delete(`${BASE_INFO.BASE_URL}api/progress/${deleteProgressId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showToast("进度删除成功", "success");
      fetchProgressList(true);
    } catch (err) {
      showToast("删除失败", "error");
    } finally {
      setClearAlertVisible(false);
      setDeleteProgressId(null);
    }
  };

  const handleClearAllProgress = async () => {
    if (progressList.length === 0) {
      showToast("没有可删除的进度报告", "warning");
      return;
    }
    setClearAllAlertVisible(true);
  };

  const confirmClearAll = async () => {
    setIsCreating(true);
    try {
      const deletePromises = progressList.map(progress =>
        api.delete(`${BASE_INFO.BASE_URL}api/progress/${progress.progress_id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );
      await Promise.all(deletePromises);
      showToast("所有进度已清空", "success");
      fetchProgressList(true);
    } catch (err) {
      showToast("清空失败", "error");
    } finally {
      setIsCreating(false);
      setClearAllAlertVisible(false);
    }
  };

  const openProgressModal = (progress = null) => {
    setIsEditing(!!progress);
    setCurrentProgress(progress);
    setEditTitle(progress ? progress.title : '');
    setEditDescription(progress ? progress.content : '');
    setEditTimelineType(progress ? progress.timeline_type : 'progress_report');
    setEditEventTime(progress ? new Date(progress.event_time) : new Date());
    setShowProgressModal(true);
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setCurrentProgress(null);
    setIsEditing(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || editEventTime;
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' || Platform.OS === 'ios') {
      setEditEventTime(currentDate);
    }
  };

  useEffect(() => {
    if (isFocused && authToken && userData?.team_id && !isCreating) {
      fetchProgressList(true);
    }
  }, [isFocused, authToken, userData, isCreating, fetchProgressList]);


  if (loading || isCreating) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <Text className="mt-4 text-gray-700 dark:text-gray-300">
          {isCreating ? '正在从模板创建进度报告...' : '加载中...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <Text className="text-lg text-[#f56c6c] dark:text-red-400 mb-4">{error}</Text>
        <TouchableOpacity
          className="px-4 py-2 bg-[#409eff] rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white">返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 dark:bg-gray-900">
      <FlatList
        data={progressList}
        keyExtractor={(item) => item.progress_id.toString()}
        renderItem={({ item }) => (
          <ProgressCard
            progress={item}
            onEdit={openProgressModal}
            onDelete={handleDeleteProgress}
          />
        )}
        contentContainerStyle={{
          padding: 20,
          flex: progressList.length === 0 && !loadingList ? 1 : undefined
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 dark:text-gray-400">没有进度报告</Text>
          </View>
        )}
        refreshing={loadingList}
        onRefresh={() => fetchProgressList(true)}
      />

      {/* 浮动按钮区域 */}
      <View className="absolute bottom-6 right-6 rounded-full border border-gray-600 overflow-hidden">
        {/* 清空所有进度的按钮 */}
        <TouchableOpacity
          onPress={handleClearAllProgress}
          className='bg-red-500 p-2 justify-center items-center'
        >
          <Icon name="delete-sweep" size={30} color="white" />
        </TouchableOpacity>
        
        {/* 创建新进度的按钮 */}
        <TouchableOpacity
          onPress={() => openProgressModal()}
          className='p-2 self-center justify-center bg-[#409eff]'
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>

        {/* AI助手按钮 */}
        <TouchableOpacity
          onPress={()=>{
            navigation.navigate("AI");
          }}
          className='border-t p-2 border-gray-300 bg-[#409eff]'
        >
          <Icon name="help" size={30} color="#fff"/>
        </TouchableOpacity>
      </View>

      {/* 编辑/创建进度报告的 Modal */}
      {showProgressModal &&
        <View
          className='bg-gray-50 dark:bg-gray-900'
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          }}>
          <ScrollView className="flex-1 p-5 dark:bg-gray-900">
            <Text className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">
              {isEditing ? '编辑进度报告' : '创建新进度报告'}
            </Text>
            <InputBox
              placeholder="标题 *"
              value={editTitle}
              onChangeText={setEditTitle}
              className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <Text className="text-gray-700 dark:text-gray-300 mb-2">进度类型 *</Text>
            <View className="flex-row">
              {ALLOWED_TIMELINE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`py-2 px-4 mr-3 rounded-lg ${editTimelineType === type ? 'bg-[#409eff]' : 'bg-gray-200 dark:bg-gray-700'}`}
                  onPress={() => setEditTimelineType(type)}
                >
                  <Text className={`${editTimelineType === type ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                    {type === 'meeting' ? '会议' : type === 'deadline' ? '截止日期' : type === 'competition' ? '比赛' : '进度报告'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="mb-5 mt-4">
              <Text className="text-gray-700 dark:text-gray-300 mb-2">事件时间 *</Text>
              <TouchableOpacity
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg bg-white dark:bg-gray-800"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-gray-900 dark:text-white">{editEventTime.toLocaleString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={editEventTime}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}
            </View>
            <MarkdownInput
              value={editDescription}
              onChange={setEditDescription}
              placeholder="请输入进度内容..."
            />
            <TouchableOpacity
              onPress={handleSaveProgress}
              disabled={isCreating || !editDescription.trim() || !editTitle.trim()}
              className={`p-4 rounded-lg items-center mt-5 mb-3 ${isCreating ? 'bg-gray-300' : 'bg-[#409eff]'}`}
            >
              {isCreating ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">{isEditing ? '更新进度' : '创建进度'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={closeProgressModal}
              className="p-4 rounded-lg items-center bg-gray-300"
            >
              <Text className="text-white font-bold">取消</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      }

      {/* 单个删除的CustomAlert */}
      <CustomAlert
        visible={ClearAlertVisible}
        title="确认删除"
        message="你确定要删除这个进度报告吗？"
        buttons={[
          { text: "取消", style: "cancel", onPress: () => setClearAlertVisible(false) },
          { text: "删除", style: "destructive", onPress: confirmDelete }
        ]}
        onClose={() => setClearAlertVisible(false)}
      />

      {/* 清空所有进度的CustomAlert */}
      <CustomAlert
        visible={ClearAllAlertVisible}
        title="确认清空所有进度"
        message="你确定要删除所有进度报告吗？此操作不可撤销。"
        buttons={[
          { text: "取消", style: "cancel", onPress: () => setClearAllAlertVisible(false) },
          { text: "清空", style: "destructive", onPress: confirmClearAll }
        ]}
        onClose={() => setClearAllAlertVisible(false)}
      />
    </View>
  );
};

export default UploadExample;