import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, ScrollView, Modal, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getItemFromAsyncStorage, setItemToAsyncStorage, removeItemFromAsyncStorage } from '../../../../utils/LocalStorage'; // Adjust path as needed
import axios from 'axios';
import { BASE_INFO } from '../../../../constant/base';
import { useColorScheme } from 'nativewind';
import { WebView } from 'react-native-webview';
import BackIcon from "../../../../components/backIcon/backIcon";
import InputBox from "../../../../components/inputBox/inputBox";

const VDITOR_CACHE_KEY = 'vditor_draft_content';

const UploaderScreen = () => {
  const { colorScheme } = useColorScheme();
  const [title, setTitle] = useState('');
  const [contentDisplay, setContentDisplay] = useState('');
  const [vditorMarkdownContent, setVditorMarkdownContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [authKey, setAuthKey] = useState(null);
  const [error, setError] = useState(null);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showVditorModal, setShowVditorModal] = useState(false);
  const lastSubmitTimeRef = useRef(0);
  const webViewRef = useRef(null);

  useEffect(() => {
    const loadDataAndCache = async () => {
      try {
        const [userData, token, cachedVditorContent] = await Promise.all([
          getItemFromAsyncStorage('user'),
          getItemFromAsyncStorage('accessToken'),
          getItemFromAsyncStorage(VDITOR_CACHE_KEY),
        ]);

        if (!userData || !token) {
          throw new Error('用户未登录');
        }
        setAuthKey(token);
        await fetchTags(token);

        if (cachedVditorContent) {
          setVditorMarkdownContent(cachedVditorContent);

          setContentDisplay(cachedVditorContent.substring(0, 200) + (cachedVditorContent.length > 200 ? '...' : ''));
        }
      } catch (e) {
        setError(e.message);
      }
    };

    loadDataAndCache();
  }, []);

  useEffect(() => {
    if (vditorMarkdownContent) {
      setItemToAsyncStorage(VDITOR_CACHE_KEY, vditorMarkdownContent);
    } else {
      removeItemFromAsyncStorage(VDITOR_CACHE_KEY);
    }
  }, [vditorMarkdownContent]);

  const fetchTags = async (token) => {
    try {
      setIsLoadingTags(true);
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableTags(response.data);
    } catch (error) {
      console.error('获取标签失败:', error);
      setError('加载标签失败');
    } finally {
      setIsLoadingTags(false);
    }
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert('错误', '标签名称不能为空');
      return;
    }

    try {
      setIsUploading(true);
      const response = await axios.post(
        `${BASE_INFO.BASE_URL}api/tags`,
        { tag_name: newTagName },
        { headers: { Authorization: `Bearer ${authKey}` } }
      );

      setAvailableTags([...availableTags, response.data.tag]);
      setSelectedTags([...selectedTags, response.data.tag.tag_id]);
      setNewTagName('');
      setShowAddTagModal(false);
      Alert.alert('成功', '标签创建成功');
    } catch (error) {
      console.error('创建标签失败:', error);
      Alert.alert('错误', error.response?.data?.message || '创建标签失败');
    } finally {
      setIsUploading(false);
    }
  };

  const selectCoverImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0].uri) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败');
    }
  };

  const uploadImage = async (uri, fileName = `photo_${Date.now()}.jpg`) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const file = {
        uri,
        type: 'image/jpeg',
        name: fileName,
      };
      formData.append('file', file);
      formData.append('bucketName', 'posts');

      const response = await axios.post(`${BASE_INFO.BASE_URL}upload/quick`, formData, {
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / (progressEvent.total || 1)) * 100);
          setUploadProgress(progress);
        },
      });

      return response.data.objectName;
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const createPost = async () => {
    const now = Date.now();
    if (now - lastSubmitTimeRef.current < 5000) {
      Alert.alert('提示', `请等待 ${Math.ceil((5000 - (now - lastSubmitTimeRef.current)) / 1000)} 秒后再提交.`);
      return;
    }

    if (!authKey) {
      Alert.alert('错误', '请先登录');
      return;
    }

    if (!title || !vditorMarkdownContent) {
      Alert.alert('错误', '标题和内容是必填项');
      return;
    }

    try {
      setIsUploading(true);

      let coverImageUrl = null;
      if (coverImage) {
        const objectName = await uploadImage(coverImage);
        coverImageUrl = `${BASE_INFO.BASE_URL}dl/posts/${objectName}`;
      }

      const response = await axios.post(
        `${BASE_INFO.BASE_URL}api/posts`,
        {
          title,
          content: vditorMarkdownContent,
          cover_image_url: coverImageUrl,
          tagIds: selectedTags,
        },
        {
          headers: { Authorization: `Bearer ${authKey}` },
        }
      );

      Alert.alert('成功', '帖子创建成功');
      resetForm();
      lastSubmitTimeRef.current = now;
    } catch (error) {
      console.error('创建帖子失败:', error);
      Alert.alert('错误', error.response?.data?.message || '创建帖子失败');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContentDisplay('');
    setVditorMarkdownContent('');
    setLocation('');
    setSelectedTags([]);
    setCoverImage(null);
    setTagSearch('');
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const cleanMDContent = () => {
    setVditorMarkdownContent('');
    setContentDisplay('');
    removeItemFromAsyncStorage(VDITOR_CACHE_KEY);
  };

  const onWebViewMessage = useCallback(async (event) => {
    const message = JSON.parse(event.nativeEvent.data);
    if (message.type === 'VDITOR_SUBMIT') {
      setVditorMarkdownContent(message.content);
      setContentDisplay(message.content.substring(0, 200) + (message.content.length > 200 ? '...' : ''));
      setShowVditorModal(false); // Close the modal
    } else if (message.type === 'UPLOAD_IMAGE') {
      try {
        Alert.alert('提示', '图片上传功能需要配置文件保存逻辑，当前只接收数据。');
        const objectName = 'PLACEHOLDER_OBJECT_NAME.jpg';
        const imageUrl = `${BASE_INFO.BASE_URL}sdl/posts/${objectName}`;

        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (vditorInstance) {
                vditorInstance.insertValue('![](${imageUrl})\\n');
            }
          `);
        }
      } catch (uploadError) {
        console.error('Vditor图片上传失败:', uploadError);
        Alert.alert('错误', 'Vditor图片上传失败');
      }
    } else if (message.type === 'VDITOR_READY') {
      if (webViewRef.current && vditorMarkdownContent) {
        webViewRef.current.injectJavaScript(`
          if (vditorInstance) {
              vditorInstance.setValue(${JSON.stringify(vditorMarkdownContent || '')});
          }
        `);
      }
    }
  }, [vditorMarkdownContent, authKey]);

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

  if (!authKey) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <Text className="mt-4 text-gray-700 dark:text-gray-300">加载中...</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 dark:bg-gray-900'>
      <BackIcon/>
      <ScrollView className="flex-1 p-5 0">
        <Text className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">创建新帖子</Text>

        {/* Title Input */}
        <InputBox
          placeholder="标题 *"
          value={title}
          style={{height:50}}
          onChangeText={setTitle}
        />
        {/* Content Edit Button */}
        <TouchableOpacity
          onPress={() => setShowVditorModal(true)}
          className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800"
        >
          <Text className=" dark:text-gray-600 text-gray-400 font-semibold">
            {contentDisplay ? '已编辑内容 (点击编辑)' : '点击编辑内容 *'}
          </Text>
          {contentDisplay ? (
            <Text className="mt-2 text-gray-700 dark:text-gray-300" numberOfLines={5}>
              {contentDisplay}
            </Text>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={()=>cleanMDContent()}
          className="border border-gray-300 dark:border-gray-600 p-4 mb-5 rounded-lg items-center bg-gray-50 dark:bg-gray-700"
        >
          <Text className="text-gray-700 dark:text-gray-300">清空已编辑内容</Text>
        </TouchableOpacity>
        
        {/* Cover Image Upload */}
        <TouchableOpacity
          onPress={selectCoverImage}
          className="border border-gray-300 dark:border-gray-600 p-4 mb-3 rounded-lg items-center bg-gray-50 dark:bg-gray-700"
        >
          <Text className="text-gray-700 dark:text-gray-300">
            {coverImage ? '更换封面图片' : '选择封面图片'}
          </Text>
        </TouchableOpacity>

        {coverImage && (
          <Image
            source={{ uri: coverImage }}
            className="w-full h-48 mb-5 rounded-lg"
          />
        )}

        {/* Tags Selection */}
        <View className="flex-row justify-between items-center mb-3 mt-3">
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">标签</Text>
          <TouchableOpacity
            onPress={() => setShowAddTagModal(true)}
            className="px-3 py-1 bg-green-600 rounded-full"
          >
            <Text className="text-white text-sm">+ 新建标签</Text>
          </TouchableOpacity>
        </View>

        {/* Tag Search */}
        <InputBox
          placeholder="搜索标签..."
          value={tagSearch}
          onChangeText={setTagSearch}
        />

        {isLoadingTags ? (
          <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        ) : (
          <View className="flex-row flex-wrap mb-4">
            {filteredTags.map((tag) => (
              <TouchableOpacity
                key={tag.tag_id}
                onPress={() => toggleTag(tag.tag_id)}
                className={`px-3 py-2 m-1 rounded-full ${
                  selectedTags.includes(tag.tag_id)
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <Text
                  className={`${
                    selectedTags.includes(tag.tag_id)
                      ? 'text-white'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {tag.tag_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">已选标签:</Text>
            <View className="flex-row flex-wrap">
              {selectedTags.map((tagId) => {
                const tag = availableTags.find((t) => t.tag_id === tagId);
                return tag ? (
                  <TouchableOpacity
                    key={tag.tag_id}
                    onPress={() => toggleTag(tag.tag_id)}
                    className="px-3 py-2 m-1 rounded-full bg-blue-600"
                  >
                    <Text className="text-white">
                      {tag.tag_name} ×
                    </Text>
                  </TouchableOpacity>
                ) : null;
              })}
            </View>
          </View>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
            {uploadProgress > 0 && (
              <Text className="mt-1 text-gray-600 dark:text-gray-400">上传中...</Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={createPost}
          disabled={isUploading || (Date.now() - lastSubmitTimeRef.current < 5000)}
          className={`p-4 rounded-lg items-center mb-10 ${
            isUploading || (Date.now() - lastSubmitTimeRef.current < 5000) ? 'bg-gray-400' : 'bg-blue-600'
          }`}
        >
          <Text className="text-white font-bold">
            {isUploading ? '正在创建...' : '创建帖子'}
          </Text>
        </TouchableOpacity>

        {/* Add Tag Modal */}
        <Modal
          visible={showAddTagModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddTagModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50 p-5">
            <View className="w-full bg-white dark:bg-gray-800 p-5 rounded-lg">
              <Text className="text-xl font-bold mb-4 text-gray-900 dark:text-white">新建标签</Text>

              <InputBox
                placeholder="标签名称"
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={newTagName}
                onChangeText={setNewTagName}
                className="border border-gray-300 dark:border-gray-600 p-3 mb-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                  onPress={() => setShowAddTagModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg mr-2"
                >
                  <Text className="text-gray-800 dark:text-gray-200">取消</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={createNewTag}
                  disabled={isUploading || !newTagName.trim()}
                  className={`px-4 py-2 rounded-lg  ${
                    isUploading || !newTagName.trim() ? 'bg-green-400' : 'bg-green-600'
                  }`}
                >
                  <Text className="text-white">创建</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Vditor Modal */}
        <Modal
          visible={showVditorModal}
          animationType="slide"
          onRequestClose={() => setShowVditorModal(false)}
        >
          <View style={{ flex: 1 }}>
            <WebView
              ref={webViewRef}
              source={
                Platform.OS === 'android'
                  ? { uri: 'file:///android_asset/web/vditor.html' }
                  : require('../../../../assets/web/vditor.html')
              }
              style={{ flex: 1 }}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowFileAccess={true}
              scalesPageToFit={false}
              onMessage={onWebViewMessage}
              onLoadEnd={() => {
                  if (webViewRef.current) {
                      webViewRef.current.injectJavaScript(`
                          if (typeof vditorInstance !== 'undefined' && vditorInstance) {
                              vditorInstance.setValue(${JSON.stringify(vditorMarkdownContent || '')});
                          } else {
                              // Fallback if vditorInstance isn't ready immediately (though 'after' should handle this)
                              document.addEventListener('VDITOR_READY', () => {
                                  vditorInstance.setValue(${JSON.stringify(vditorMarkdownContent || '')});
                              }, { once: true }); // Ensure it only runs once
                          }
                          true; // Important for injectJavaScript
                      `);
                  }
              }}
            />
          </View>
        </Modal>
      </ScrollView>
    </View>
    
  );
};

export default UploaderScreen;