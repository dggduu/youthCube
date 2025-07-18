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
import Markdown from "react-native-markdown-display";
import InputBox from "../../../components/inputBox/inputBox";
import { useNavigation } from "@react-navigation/native";

const ProgressCard = ({ progress, onEdit, onDelete}) => {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
  const subTextColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-300';

  const isDark = colorScheme == "dark";
  const formattedEventTime = new Date(progress.event_time).toLocaleString();
  const formattedCreatedAt = new Date(progress.created_at).toLocaleString();

  const timelineTypeMap = {
    meeting: '会议',
    deadline: '截止日期',
    competition: '比赛',
    progress_report: '进度报告'
  };

  const mdStyle = {
    body: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    heading1: {
      fontWeight: 800,
      padding: 5,
    },
    heading2: {
      fontWeight:700,
      margin: 5,
    },
    heading3: {
      fontWeight:600,
      margin: 5,
    },
    code: { // 内联代码样式
        backgroundColor: isDark ? '#333333' : '#F5F5F5',
        padding: 2,
        borderRadius: 3,
        color: isDark ? '#FFFFFF' : '#000000',
      },
      codeBlock: { // 代码块样式
        backgroundColor: isDark ? '#2E2E2E' : '#F9F9F9',
        padding: 10,
        borderRadius: 5,
        overflow: 'hidden',
        magrin: 10,
      },
      fence: { // 特定于 fenced code blocks 的样式
        backgroundColor: isDark ? '#2E2E2E' : '#F9F9F9',
        magrin: 10,
      },
      list_item: {
        color: isDark ? '#E6E6E6' : '#1A1A1A',
      },
      unordered_list_icon: {
        color: isDark ? '#FF9800' : '#F57C00', // 修改圆点颜色
      },
      ordered_list_icon: {
        color: isDark ? '#4CAF50' : '#388E3C', // 编号颜色
      },
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
      <Markdown style={mdStyle}>{progress.content}</Markdown>

      <View className="flex-row justify-end mt-4">
        <TouchableOpacity
          className="bg-blue-500 py-2 px-3 rounded-md mr-2"
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

  const [showVditorModal, setShowVditorModal] = useState(false);
  const [vditorMarkdownContent, setVditorMarkdownContent] = useState('');
  const webViewRef = useRef(null);

  const navigation = useNavigation();

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
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/team/${teamId}/progress?page=${currentPageToFetch}&size=10`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '获取进度列表失败');
      }

      const data = await response.json();
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
  }, [authToken, teamId, page, totalPages, showToast]);

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
      setVditorMarkdownContent(progress.content);
      setTimelineType(ALLOWED_TIMELINE_TYPES.includes(progress.timeline_type) ? progress.timeline_type : 'meeting');
      setEventTime(new Date(progress.event_time));
    } else {
      setCurrentProgressId(null);
      setTitle('');
      setDescription('');
      setVditorMarkdownContent('');
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
    setVditorMarkdownContent('');
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
      let response;
      if (currentProgressId) {

        response = await fetch(
          `${BASE_INFO.BASE_URL}api/progress/${currentProgressId}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(progressData)
          }
        );
      } else {
        response = await fetch(
          `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(progressData)
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '提交进度失败');
      }

      showToast(currentProgressId ? "进度更新成功" : "进度提交成功", "success");
      closeProgressModal();
      setPage(0);
      setTotalPages(1);
      fetchProgressList(true);
    } catch (err) {
      showToast(`提交失败: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProgress = async (progressId) => {
    Alert.alert(
      "确认删除",
      "你确定要删除这个进度报告吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BASE_INFO.BASE_URL}api/progress/${progressId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                  },
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '删除进度失败');
              }

              showToast("进度删除成功", "success");
              setPage(0); 
              setTotalPages(1);
              fetchProgressList(true);
            } catch (err) {
              showToast(`删除失败: ${err.message}`, "error");
            }
          },
        },
      ]
    );
  };

  // VDITOR
  const onWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'contentChange') {
        setVditorMarkdownContent(message.content);
        setDescription(message.content);
      }
      if (message.type === 'VDITOR_SUBMIT') {
        setVditorMarkdownContent(message.content);
        setDescription(message.content);
        setShowVditorModal(false);
      }
    } catch (e) {
      console.warn('无法解析 WebView 消息:', event.nativeEvent.data);
    }
  };

  const injectInitialContent = () => {
    if (webViewRef.current && showVditorModal) {
      webViewRef.current.injectJavaScript(`
        if (typeof vditorInstance !== 'undefined' && vditorInstance) {
          vditorInstance.setValue(${JSON.stringify(vditorMarkdownContent)});
        } else {
          document.addEventListener('VDITOR_READY', () => {
            vditorInstance.setValue(${JSON.stringify(vditorMarkdownContent)});
          }, { once: true });
        }
        true;
      `);
    }
  };

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <Text className="text-lg text-red-500 dark:text-red-400 mb-4">{error}</Text>
        <TouchableOpacity
          className="px-4 py-2 bg-blue-600 rounded-lg"
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
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          !loadingList && (
            <Text className="text-center text-gray-600 dark:text-gray-400 mt-10">
              点击右下角按钮添加一个！
            </Text>
          )
        }
        ListFooterComponent={loadingList && page > 0 ? (
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} className="my-4" />
        ) : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <View className="absolute bottom-6 right-6 bg-blue-600 rounded-full justify-center items-center border border-gray-600">
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

      <Modal
        visible={showProgressModal}
        animationType="slide"
        onRequestClose={closeProgressModal}
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
                  timelineType === type ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
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

          <TextInput
            placeholder="进度内容 *"
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            className="border border-gray-300 dark:border-gray-600 p-3 h-40 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <TouchableOpacity
            className="bg-blue-600 py-4 px-4 rounded-lg mb-3"
            onPress={() => {
              setVditorMarkdownContent(description);
              setShowVditorModal(true);
            }}
          >
            <Text className="text-white font-semibold">使用 Markdown 编辑器</Text>
          </TouchableOpacity>
          <Text className='text-sm text-gray-600 dark:text-gray-200 mb-5'>- 可以使用markdown编辑器编辑进度内容</Text>

          <TouchableOpacity
            onPress={handleSubmitProgress}
            disabled={isSubmitting || !description.trim() || !title.trim()}
            className={`p-4 rounded-lg items-center mb-5 ${
              isSubmitting || !description.trim() || !title.trim()
                ? 'bg-gray-400'
                : 'bg-blue-600'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">
                {currentProgressId ? '更新进度' : '提交进度'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={closeProgressModal}
            className="p-4 rounded-lg items-center bg-gray-400 mb-10"
          >
            <Text className="text-white font-bold">取消</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* VDITOR Modal */}
      <Modal
        visible={showVditorModal}
        animationType="slide"
        onRequestClose={() => setShowVditorModal(false)}
      >
        <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            source={{ uri: 'file:///android_asset/web/vditor.html' }}
            style={{ flex: 1 }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={true}
            scalesPageToFit={false}
            onMessage={onWebViewMessage}
            onLoadEnd={injectInitialContent}
          />
        </View>
      </Modal>
    </View>
  );
};

export default UploadProgress;