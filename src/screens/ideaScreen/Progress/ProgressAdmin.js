import { View, Text, TouchableOpacity, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import { useToast } from "../../../components/tip/ToastHooks";
import { BASE_INFO } from "../../../constant/base";
import { useColorScheme } from 'nativewind';
import WaterfallFlow from 'react-native-waterfall-flow';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';
import axios from "axios";
import MarkdownInput from "../../../components/MarkdownInput";
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const ProgressAdmin = () => {
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
      const token = await getItemFromAsyncStorage("accessToken");
      setAccessToken(token);
      
      const response = await api(
        `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }
      
      const data = response.data;
      setProgressList(data.items);
      console.log("progress",teamId);
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

  const handleDelete = async (progressId) => {
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
          event_time: eventTime.toISOString()
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
    if (webViewRef.current && vditorMarkdownContent) {
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
      <View className="flex-1 items-center justify-center dark:bg-gray-900">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? 'white' : 'black'} />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    if (item.timeline_type !== 'progress_report') {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={()=>{
          navigation.navigate("Comment", {
            progress_id: item.progress_id,
            role: role
          });
        }}
        className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm mb-3 mx-4"
      >
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold dark:text-white flex-1 mr-2">
            {item.title}
          </Text>
          <View className={`px-3 py-1 rounded-full ${
            item.status === 'accept' ? 'bg-green-100' : 
            item.status === 'reject' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            <Text className={`text-xs ${
              item.status === 'accept' ? 'text-green-800' : 
              item.status === 'reject' ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {item.status === 'accept' ? '已通过' : 
               item.status === 'reject' ? '已拒绝' : '待审核'}
            </Text>
          </View>
        </View>
        
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          {new Date(item.event_time).toLocaleString()}
        </Text>
        
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          提交者: {item.submitter.name}
        </Text>
        
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => handleDelete(item.progress_id)}
            className="px-3 py-1 bg-red-500 rounded-lg"
          >
            <Text className="text-white text-sm">删除</Text>
          </TouchableOpacity>
          
          <View className="flex-row">
            {item.status !== 'accept' && (
              <TouchableOpacity
                onPress={() => handleStatusUpdate(item.progress_id, 'accept')}
                className="px-3 py-1 bg-green-500 rounded-lg mr-2"
              >
                <Text className="text-white text-sm">通过</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => handleStatusUpdate(item.progress_id, 'pending')}
              className="px-3 py-1 bg-gray-100 rounded-lg mr-2"
            >
              <Text className="text-black text-sm">重审</Text>
            </TouchableOpacity>
            
            {item.status !== 'reject' && (
              <TouchableOpacity
                onPress={() => handleStatusUpdate(item.progress_id, 'reject')}
                className="px-3 py-1 bg-red-500 rounded-lg"
              >
                <Text className="text-white text-sm">拒绝</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 dark:bg-gray-900">
      {progressList.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 dark:text-gray-400">暂无进度记录</Text>
        </View>
      ) : (
        <WaterfallFlow
          data={progressList}
          renderItem={renderItem}
          numColumns={1}
          keyExtractor={(item) => item.progress_id.toString()}
          onRefresh={onRefresh}
          refreshing={refreshing}
          contentContainerStyle={{ paddingBottom: 80}}
        />
      )}
      {/* 添加汇报 */}
      <TouchableOpacity
        onPress={()=>{
          navigation.navigate("TeamUploader");
        }}
        className="absolute bottom-24 right-6 bg-blue-500 p-4 rounded-full shadow-lg"
      >
        <MaterialIcons name="task" size={24} color="white" />
      </TouchableOpacity>
      {/* 添加进度 */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-6 right-6 bg-blue-500 p-4 rounded-full shadow-lg"
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* 添加进度Moral */}
      {/* <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      > */}
        {showAddModal  && 
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
          // 点击遮罩关闭
          onTouchEnd={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
        <View className="flex-1 p-5 dark:bg-gray-900">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-xl font-bold dark:text-white">添加进度</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialIcons name="close" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <Text className='text-red-500 font-semibold mb-4'>[注]：此窗口不用于添加贡献进度</Text>
            {/* Title*/}
            <TextInput
              placeholder="标题 *"
              placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={title}
              onChangeText={setTitle}
              style={{height:50}}
              className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          <MarkdownInput
            value={description}
            onChange={setDescription}
            placeholder="请输入进度内容..."
          />

            {/* Timeline Type*/}
            <View className="mb-3">
              <Text className="text-gray-700 dark:text-gray-300 mb-2 mt-3">类型</Text>
              <View className="flex-row">
                {['meeting', 'deadline', 'competition'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`px-4 py-2 mr-2 rounded-lg ${timelineType === type ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    onPress={() => setTimelineType(type)}
                  >
                    <Text className={timelineType === type ? 'text-white' : 'text-gray-800 dark:text-gray-200'}>
                      {type === 'meeting' ? '会议' : 
                       type === 'deadline' ? '截止日期' : '比赛'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Event Time */}
            <View className="mb-5 mt-4">
              <Text className="text-gray-700 dark:text-gray-300 mb-2">事件时间</Text>
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
              className={`p-4 rounded-lg items-center mb-10 ${
                isSubmitting || !title.trim() || !description.trim() 
                  ? 'bg-gray-400' 
                  : 'bg-blue-600'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">提交进度</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>          
        </View>        
        }
    </View>
  );
}

export default ProgressAdmin;