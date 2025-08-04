//... (文件开头部分保持不变)
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getItemFromAsyncStorage } from '../../../utils/LocalStorage';
import { useToast } from '../../../components/tip/ToastHooks';
import { BASE_INFO } from '../../../constant/base';
import { useColorScheme } from 'nativewind';
import WaterfallFlow from 'react-native-waterfall-flow';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import MarkdownInput from '../../../components/MarkdownInput';
import setupAuthInterceptors from '../../../utils/axios/AuthInterceptors';
const api = axios.create();
setupAuthInterceptors(api);

const ProgressAdmin = () => {
  // ... (状态和函数保持不变)
  const route = useRoute();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { colorScheme } = useColorScheme();
  const { teamId, role } = route.params;

  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timelineType, setTimelineType] = useState('meeting');
  const [eventTime, setEventTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showVditorModal, setShowVditorModal] = useState(false);
  const [vditorMarkdownContent, setVditorMarkdownContent] = useState('');
  const webViewRef = React.useRef(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const token = await getItemFromAsyncStorage('accessToken');
      setAccessToken(token);

      const response = await api(
        `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      const data = response.data;
      setProgressList(data.items);
      console.log('progress', teamId);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (progressId, newStatus) => {
    try {
      await axios.put(
        `${BASE_INFO.BASE_URL}api/progress/${progressId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      showToast('状态更新成功', 'success');
      fetchProgress();
    } catch (error) {
      let errorMessage = '状态更新失败';

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = '网络错误，请检查连接';
      } else {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async progressId => {
    try {
      await axios.delete(
        `${BASE_INFO.BASE_URL}api/progress/${progressId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      showToast('进度已删除', 'success');
      fetchProgress();
    } catch (error) {
      let errorMessage = '删除进度失败';

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = '网络错误，请检查连接';
      } else {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgress();
  };

  const submitProgress = async () => {
    if (!title.trim() || !description.trim()) {
      showToast('请填写标题和内容', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
        {
          title,
          description,
          timeline_type: timelineType,
          event_time: eventTime.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      showToast('进度提交成功', 'success');
      setShowAddModal(false);
      fetchProgress();
      resetForm();
    } catch (error) {
      let errorMessage = '进度提交失败';

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = '网络错误，请检查您的连接';
      } else {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTimelineType('meeting');
    setEventTime(new Date());
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEventTime(selectedDate);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator
          size="large"
          color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
        />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    if (item.timeline_type !== 'progress_report') {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Comment', {
            progress_id: item.progress_id,
            role: role,
          });
        }}
        activeOpacity={0.8}
        className="mx-4 mb-3 rounded-lg bg-gray-50 border border-gray-200 dark:border-gray-600 p-4 shadow-md dark:bg-gray-800"
      >
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="flex-1 text-xl font-bold text-gray-900 dark:text-white">
            {item.title}
          </Text>
          <View
            className={`rounded-full px-3 py-1 ${
              item.status === 'accept'
                ? 'bg-green-100 dark:bg-green-700'
                : item.status === 'reject'
                ? 'bg-red-100 dark:bg-red-700'
                : 'bg-yellow-100 dark:bg-yellow-700'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                item.status === 'accept'
                  ? 'text-green-800 dark:text-green-200'
                  : item.status === 'reject'
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}
            >
              {item.status === 'accept'
                ? '已通过'
                : item.status === 'reject'
                ? '已拒绝'
                : '待审核'}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(item.event_time).toLocaleString()}
        </Text>
        <Text className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          提交者: {item.submitter.name}
        </Text>
        <View className="flex-row items-center justify-end">
          <TouchableOpacity
            onPress={() => handleDelete(item.progress_id)}
            className="h-9 items-center justify-center rounded-md border border-red-500 px-4"
          >
            <Text className="text-sm font-semibold text-red-500">删除</Text>
          </TouchableOpacity>
          <View className="flex-row">
            {item.status !== 'accept' && (
              <TouchableOpacity
                onPress={() => handleStatusUpdate(item.progress_id, 'accept')}
                className="ml-2 h-9 items-center justify-center rounded-md border border-transparent bg-green-500 px-4"
              >
                <Text className="text-sm font-semibold text-white">通过</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleStatusUpdate(item.progress_id, 'pending')}
              className="ml-2 h-9 items-center justify-center rounded-md border border-gray-300 bg-white px-4 dark:border-gray-600 dark:bg-gray-800"
            >
              <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                重审
              </Text>
            </TouchableOpacity>
            {item.status !== 'reject' && (
              <TouchableOpacity
                onPress={() => handleStatusUpdate(item.progress_id, 'reject')}
                className="ml-2 h-9 items-center justify-center rounded-md border border-transparent bg-red-500 px-4"
              >
                <Text className="text-sm font-semibold text-white">拒绝</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {progressList.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400">暂无进度记录</Text>
        </View>
      ) : (
        <WaterfallFlow
          data={progressList}
          renderItem={renderItem}
          numColumns={1}
          keyExtractor={item => item.progress_id.toString()}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
        />
      )}
      {/* 添加汇报 */}
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('TeamUploader');
        }}
        className="absolute bottom-28 right-6 rounded-full bg-[#409eff] p-4 shadow-lg"
      >
        <MaterialIcons name="task" size={24} color="white" />
      </TouchableOpacity>
      {/* 添加进度 */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-10 right-6 rounded-full bg-[#409eff] p-4 shadow-lg"
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-white p-6 dark:bg-gray-900">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              添加进度
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialIcons
                name="close"
                size={24}
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1">
            <Text className="mb-4 font-semibold text-red-500">
              [注]：此窗口不用于添加贡献进度
            </Text>
            {/* Title*/}
            <TextInput
              placeholder="标题 *"
              placeholderTextColor={
                colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'
              }
              value={title}
              onChangeText={setTitle}
              className="mb-4 h-12 rounded-lg border border-gray-300 bg-white p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <MarkdownInput
              value={description}
              onChange={setDescription}
              placeholder="请输入进度内容..."
            />
            {/* Timeline Type*/}
            <View className="mb-4">
              <Text className="mb-2 mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                类型
              </Text>
              <View className="flex-row">
                {['meeting', 'deadline', 'competition'].map(type => (
                  <TouchableOpacity
                    key={type}
                    className={`mr-2 h-9 items-center justify-center rounded-lg px-4 ${
                      timelineType === type
                        ? 'bg-[#409eff]'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onPress={() => setTimelineType(type)}
                  >
                    <Text
                      className={`text-sm ${
                        timelineType === type
                          ? 'text-white'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {type === 'meeting'
                        ? '会议'
                        : type === 'deadline'
                        ? '截止日期'
                        : '比赛'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Event Time */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                事件时间
              </Text>
              <TouchableOpacity
                className="h-9 items-center justify-start rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
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
                  display="default"
                  onChange={onDateChange}
                  positiveButtonLabel="确定"
                  negativeButtonLabel="取消"
                />
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={submitProgress}
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className={`mb-10 h-11 items-center justify-center rounded-lg ${
                isSubmitting || !title.trim() || !description.trim()
                  ? 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-[#409eff]'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">提交进度</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default ProgressAdmin;