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
import axios from "axios";
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
import MarkdownInput from "../../../components/MarkdownInput";
import AttachmentUploader from "../../../components/AttachmentUploader";
// 移除了 DateTimePicker 的导入

const api = axios.create();
setupAuthInterceptors(api);

const AddProgress = () => {
  const route = useRoute();
  const { showToast } = useToast();
  const { colorScheme } = useColorScheme();
  const [teamId, setTeamId] = useState(0);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  // 初始化为当前时间
  const [eventTime, setEventTime] = useState(new Date()); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Media attachment state
  const [mediaAttachment, setMediaAttachment] = useState(null);
  const [mediaType, setMediaType] = useState('');

  // Markdown editor state
  const [showVditorModal, setShowVditorModal] = useState(false);
  const [vditorMarkdownContent, setVditorMarkdownContent] = useState('');
  const webViewRef = useRef(null);

  // Load auth token and team ID
  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        const userData = await getItemFromAsyncStorage("user");
        const token = await getItemFromAsyncStorage("accessToken");
        if (!token || !userData) throw new Error('用户未登录');
        setAuthToken(token);
        setTeamId(userData.team_id);
      } catch (err) {
        setError(err.message);
      }
    };

    loadAuthToken();
  }, []);

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
      // 使用当前时间
      event_time: eventTime.toISOString(), 
      media_url: mediaAttachment?.url || null,
      media_type: mediaAttachment?.type || null
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
      resetForm();
    } catch (err) {
      handleSubmissionError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setTitle('');
    setMediaAttachment(null);
    setMediaType('image');
    // 重置时也可以选择是否重置 eventTime 为当前时间
    // setEventTime(new Date());
  };

  const handleSubmissionError = (err) => {
    let errorMessage = '提交失败';
    if (err.response && err.response.data) {
      errorMessage = err.response.data.message || errorMessage;
    } else if (err.request) {
      errorMessage = '网络错误，请检查您的连接';
    } else {
      errorMessage = err.message;
    }
    showToast(`提交失败: ${errorMessage}`, "error");
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
      <ScrollView className="flex-1 p-5">
        <Text className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">创建进度报告</Text>

        {/* Title Input */}
        <TextInput
          placeholder="标题 *"
          placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
          value={title}
          onChangeText={setTitle}
          style={{height:50}}
          className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />

        {/* Markdown Input */}
        <MarkdownInput
          value={description}
          onChange={setDescription}
          placeholder="请输入进度内容..."
        />

        {/* Attachment Uploader */}
        <AttachmentUploader 
          AccessToken={authToken}
          fileUrl={mediaAttachment}
          setFileUrl={setMediaAttachment}
        />

        {/* 可以选择性地显示当前时间，但通常不需要，因为它是后台自动记录的
        <View className="mb-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Text className="text-gray-700 dark:text-gray-300">事件时间: {eventTime.toLocaleString()}</Text>
        </View> */}

        {/* Submit Button */}
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

      {/* Markdown Editor Modal */}
      <Modal
        visible={showVditorModal}
        animationType="slide"
        onRequestClose={() => setShowVditorModal(false)}
      >
        <View className="flex-1 bg-white dark:bg-gray-900">
          <WebView
            ref={webViewRef}
            source={{ uri: `${BASE_INFO.BASE_URL}markdown-editor` }}
            onMessage={onWebViewMessage}
            onLoadEnd={injectInitialContent}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
          <TouchableOpacity
            className="absolute top-4 right-4 bg-red-500 p-2 rounded-full"
            onPress={() => setShowVditorModal(false)}
          >
            <Text className="text-white">关闭</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AddProgress;