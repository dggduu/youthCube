import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  Alert,
  ScrollView,
  Platform,
  useColorScheme
} from 'react-native';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { getItemFromAsyncStorage } from '../../../utils/LocalStorage';
import { BASE_INFO } from '../../../constant/base';
import { useToast } from '../../../components/tip/ToastHooks';
import { WebView } from 'react-native-webview';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Markdown from "react-native-marked";
import InputBox from "../../../components/inputBox/inputBox";
import { useNavigation } from "@react-navigation/native";
import MarkdownInput from "../../../components/MarkdownInput";
import axios from 'axios';
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
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
    deadline: '任务点',
    competition: '比赛',
    progress_report: '进度报告'
  };

  return (
    <View className={`border ${borderColor} rounded-lg p-4 mb-4 shadow-md ${cardBg}`}>
      <Text className={`text-lg font-bold mb-2 ${textColor}`}>{progress.title || '无标题'}</Text>
      <Text className={`text-sm mb-2 ${subTextColor}`}>类型: {timelineTypeMap[progress.timeline_type] || progress.timeline_type}</Text>
      <Text className={`text-sm mb-2 ${subTextColor}`}>状态: {
        progress.status === 'pending'
          ? '待处理'
          : progress.status === 'accept'
          ? '已通过'
          : '已拒绝'
      }</Text>
      <Text className={`text-sm mb-2 ${subTextColor}`}>事件时间: {formattedEventTime}</Text>
      <Text className={`text-sm mb-4 ${subTextColor}`}>提交人: {progress.submitter?.name || '未知'}</Text>
          <Markdown
            value={progress.content}
            flatListProps={{
              initialNumToRender: 8,
            }}
          />
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

const UploadProgress = () => {
  const route = useRoute();
  const { showToast } = useToast();
  const { colorScheme } = useColorScheme();
  const { teamId } = route.params;
  const isFocused = useIsFocused();

  const [progressList, setProgressList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [currentProgressId, setCurrentProgressId] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [timelineType, setTimelineType] = useState('meeting');
  const [eventTime, setEventTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  // CustomAlert 相关状态
  const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
  const [progressToDeleteId, setProgressToDeleteId] = useState(null);

  const ALLOWED_TIMELINE_TYPES = ['meeting', 'deadline', 'competition'];

  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        const token = await getItemFromAsyncStorage("accessToken");
        if (!token) throw new Error('用户未登录');
        setAuthToken(token);
      } catch (err) {
        setError(err.message);
      }
    };
    loadAuthToken();
  }, []);

  const fetchProgressList = useCallback(async (reset = false) => {
    if (!authToken) return;

    const currentPageToFetch = reset ? 0 : page;
    if (!reset && currentPageToFetch >= totalPages && page !== 0) return;

    try {
      setLoadingList(true);
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          params:{
            page:currentPageToFetch,
            size:10
          }
        }
      );

      const data = response.data;
      if (reset) {
        setProgressList(data.items);
      } else {
        setProgressList((prevList) => [...prevList, ...data.items]);
      }
      setTotalPages(data.totalPages);
      setPage(currentPageToFetch + 1);
    } catch (err) {
      showToast(`获取列表失败: ${err.message}`, "error");
      setError(err.message);
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  }, [authToken, teamId, showToast]);

  useEffect(() => {
    if (authToken && isFocused) {
      setPage(0);
      setTotalPages(1);
      fetchProgressList(true);
    }
  }, [authToken, isFocused, fetchProgressList]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setTotalPages(1);
    fetchProgressList(true);
  };

  const handleLoadMore = () => {
    if (!loadingList && page < totalPages) {
      fetchProgressList(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || eventTime;
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'set' || Platform.OS === 'ios') {
      setEventTime(currentDate);
    }
  };

  const openProgressModal = (progress = null) => {
    if (progress) {
      setCurrentProgressId(progress.progress_id);
      setTitle(progress.title);
      setDescription(progress.content);
      setTimelineType(ALLOWED_TIMELINE_TYPES.includes(progress.timeline_type) ? progress.timeline_type : 'meeting');
      setEventTime(new Date(progress.event_time));
    } else {
      setCurrentProgressId(null);
      setTitle('');
      setDescription('');
      setTimelineType('meeting');
      setEventTime(new Date());
    }
    setShowProgressModal(true);
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setCurrentProgressId(null);
    setTitle('');
    setDescription('');
    setTimelineType('meeting');
    setEventTime(new Date());
  };

  const handleSubmitProgress = async () => {
    if (!description.trim() || !title.trim()) {
      showToast("标题和进度内容不能为空", "warning");
      return;
    }

    if (!ALLOWED_TIMELINE_TYPES.includes(timelineType)) {
      showToast("请选择有效的进度类型 (会议, 截止日期, 比赛)", "warning");
      return;
    }

    const progressData = {
      description,
      content: description,
      timeline_type: timelineType,
      title: title,
      event_time: eventTime.toISOString(),
    };

    try {
      setIsSubmitting(true);

      if (currentProgressId) {
        await api.put(
          `${BASE_INFO.BASE_URL}api/progress/${currentProgressId}`,
          progressData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        await api.post(
          `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
          progressData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      showToast(currentProgressId ? "进度更新成功" : "进度提交成功", "success");
      closeProgressModal();
      setPage(0);
      setTotalPages(1);
      fetchProgressList(true);

    } catch (err) {
      let errorMessage = '提交进度失败';

      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = '网络错误，请检查您的连接';
      } else {
        errorMessage = err.message;
      }

      showToast(`提交失败: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgress = (progressId) => {
    setProgressToDeleteId(progressId);
    setIsDeleteAlertVisible(true);
  };
  
  const confirmDelete = async () => {
    if (!progressToDeleteId) return;

    try {
      await api.delete(
        `${BASE_INFO.BASE_URL}api/progress/${progressToDeleteId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      showToast("进度删除成功", "success");
      setPage(0);
      setTotalPages(1);
      fetchProgressList(true);
    } catch (err) {
      let errorMessage = '删除进度失败';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = '网络错误，请检查您的连接';
      } else {
        errorMessage = err.message;
      }
      showToast(`删除失败: ${errorMessage}`, "error");
    } finally {
      setIsDeleteAlertVisible(false);
      setProgressToDeleteId(null);
    }
  };


  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <Text className="text-lg text-red-500 dark:text-red-400 mb-4">{error}</Text>
        <TouchableOpacity
          className="px-4 py-2 bg-[#409eff] rounded-lg"
          onPress={() => setError(null)}
        >
          <Text className="text-white">重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!authToken) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <Text className="mt-4 text-gray-700 dark:text-gray-300">加载中...</Text>
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
        ListFooterComponent={
          loadingList && progressList.length > 0 ? (
            <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} className="my-4" />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <View className="absolute bottom-6 right-6 bg-[#409eff] rounded-full justify-center items-center border border-gray-600 overflow-hidden">
        <TouchableOpacity
          onPress={() => openProgressModal()}
          className='p-2 self-center justify-center'
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={()=>{
            navigation.navigate("AI");
          }}
          className='border-t p-2 border-gray-300'
        >
          <Icon name="help" size={30} color="#fff"/>
        </TouchableOpacity>
      </View>

      {showProgressModal && 
        <View
          className='bg-gray-50 dark:bg-gray-900'
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
        <ScrollView className="flex-1 p-5 dark:bg-gray-900">
          <Text className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">
            {currentProgressId ? '编辑进度报告' : '创建进度报告'}
          </Text>

          <InputBox
            placeholder="标题 *"
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={title}
            onChangeText={setTitle}
            className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />

          <Text className="text-gray-700 dark:text-gray-300 mb-2">进度类型 *</Text>
          <View className="flex-row">
            {ALLOWED_TIMELINE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                className={`py-2 px-4 mr-3 rounded-lg ${
                  timelineType === type ? 'bg-[#409eff]' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                onPress={() => setTimelineType(type)}
              >
                <Text className={`${timelineType === type ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {type === 'meeting' ? '会议' : type === 'deadline' ? '截止日期' : '比赛'}
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
              <Text className="text-gray-900 dark:text-white">
                {eventTime.toLocaleString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={eventTime}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>

          <MarkdownInput
            value={description}
            onChange={setDescription}
            placeholder="请输入进度内容..."
          />
          
          <TouchableOpacity
            onPress={handleSubmitProgress}
            disabled={isSubmitting || !description.trim() || !title.trim()}
            className={`p-4 rounded-lg items-center mt-5 mb-5 ${
              isSubmitting || !description.trim() || !title.trim()
                ? 'bg-gray-300'
                : 'bg-[#409eff]'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-gray-600 dark:text-gray-300 font-bold">
                {currentProgressId ? '更新进度' : '提交进度'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={closeProgressModal}
            className="p-4 rounded-lg items-center bg-gray-300 mb-10"
          >
            <Text className="text-gray-600 dark:text-gray-300 font-bold">取消</Text>
          </TouchableOpacity>
        </ScrollView>
        </View>
      }

      {/* CustomAlert for deletion */}
      <CustomAlert
        visible={isDeleteAlertVisible}
        title="确认删除"
        message="你确定要删除这个进度报告吗？"
        buttons={[
          { text: "取消", style: "cancel", onPress: () => setIsDeleteAlertVisible(false) },
          { text: "删除", style: "destructive", onPress: confirmDelete }
        ]}
        onClose={() => setIsDeleteAlertVisible(false)}
      />
    </View>
  );
};

export default UploadProgress;