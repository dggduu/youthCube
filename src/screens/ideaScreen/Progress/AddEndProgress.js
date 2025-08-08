import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getItemFromAsyncStorage } from '../../../utils/LocalStorage';
import { BASE_INFO } from '../../../constant/base';
import { useToast } from '../../../components/tip/ToastHooks';
import { useColorScheme } from 'nativewind';
import { WebView } from 'react-native-webview';
import MarkdownInput from "../../../components/MarkdownInput";
import axios from "axios";
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
import AttachmentUploader from "../../../components/AttachmentUploader";

const api = axios.create();
setupAuthInterceptors(api);

const AddProgress = () => {
  const route = useRoute();
  const { showToast } = useToast();
  const { colorScheme } = useColorScheme();
  const teamId = 12;
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [eventTime, setEventTime] = useState(new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');

  const [showVditorModal, setShowVditorModal] = useState(false);
  const [vditorMarkdownContent, setVditorMarkdownContent] = useState('');
  const webViewRef = useRef(null);

  // 获取 token
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

  // 提交进度
  const submitProgress = async () => {
    if (!description.trim()) {
      showToast("进度内容不能为空", "warning");
      return;
    }

    const newProgressData = {
      description,
      content: description,
      status: 'pending',
      timeline_type: 'progress_report',
      title: title || '未命名进度',
      event_time: eventTime,
      media_url: mediaUrl,
      media_type: mediaType
    };

    try {
      setIsSubmitting(true);
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/team/${teamId}/progress`,
        newProgressData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`请求失败，状态码：${response.status}`);
      }

      showToast("进度提交成功", "success");
      setDescription('');
      setTitle('');
      setEventTime(new Date().toISOString().slice(0, 16));
      setMediaUrl('');
      setMediaType('');
    } catch (err) {
      let errorMessage = '回复失败';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = '网络错误，请检查您的连接';
      } else {
        errorMessage = err.message;
      }
      showToast(`回复失败: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理附件上传
  const handleFileUpload = (fileInfo) => {
    setMediaUrl(fileInfo.url);
    setMediaType(fileInfo.type);
  };

  // 处理 VDITOR 的消息
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

  // 初始化 VDITOR 内容
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

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <Text className="text-lg text-[#f56c6c] dark:text-red-400 mb-4">{error}</Text>
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
      <ScrollView className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">创建结题报告</Text>

        {/* 标题 */}
        <TextInput
          placeholder="标题 *"
          placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={title}
          onChangeText={setTitle}
          style={{height:50}}
          className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        
        {/* 时间选择 */}
        <TextInput
          placeholder="事件时间"
          placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={eventTime}
          onChangeText={setEventTime}
          className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        
        <MarkdownInput
          value={description}
          onChange={setDescription}
          placeholder="请输入进度内容..."
        />
        
        {/* 附件上传 */}
        <AttachmentUploader 
          AccessToken={authToken}
          fileUrl={mediaUrl}
          setFileUrl={handleFileUpload}
        />

        {/* 提交按钮 */}
        <TouchableOpacity
          onPress={submitProgress}
          disabled={isSubmitting || !description.trim()}
          className={`p-4 rounded-lg items-center mb-10 ${
            isSubmitting || !description.trim() 
              ? 'bg-gray-300' 
              : 'bg-[#409eff]'
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
  );
};

export default AddProgress;