import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, ScrollView, Modal, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { getItemFromAsyncStorage, setItemToAsyncStorage, removeItemFromAsyncStorage } from '../../../../utils/LocalStorage';
import axios from 'axios';
import { BASE_INFO } from '../../../../constant/base';
import { useColorScheme } from 'nativewind';
import { WebView } from 'react-native-webview';
import BackIcon from "../../../../components/backIcon/backIcon";
import InputBox from "../../../../components/inputBox/inputBox";
import TagSelectionToast from "../../../../components/TagSelectionToast";
import FileUploader from "../../../../components/FileUploader";
import setupAuthInterceptors from "../../../../utils/axios/AuthInterceptors";
import { useToast } from "../../../../components/tip/ToastHooks";
const VDITOR_CACHE_KEY = 'vditor_draft_content';

const api = axios.create();
setupAuthInterceptors(api);

const UploaderScreen = () => {
  const { colorScheme } = useColorScheme();
  const [title, setTitle] = useState('');
  const [contentDisplay, setContentDisplay] = useState('');
  const [vditorMarkdownContent, setVditorMarkdownContent] = useState('');
  const [accessToken, setAccessToken] = useState("");
  const [selectedTags, setSelectedTags] = useState({
    tagIds: [],
    tags: []
  });
  const [coverImage, setCoverImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [authKey, setAuthKey] = useState(null);
  const [error, setError] = useState(null);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showVditorModal, setShowVditorModal] = useState(false);
  const [showTagSelection, setShowTagSelection] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const lastSubmitTimeRef = useRef(0);
  const webViewRef = useRef(null);
  const { showToast } = useToast();
  const handleTagSelection = (tagData) => {
    setSelectedTags({
      tagIds: tagData.tagIds || [],
      tags: tagData.tags || []
    });
  };

  useEffect(() => {
    const loadDataAndCache = async () => {
      try {
        const [userData, token, cachedVditorContent] = await Promise.all([
          getItemFromAsyncStorage('user'),
          getItemFromAsyncStorage('accessToken'),
          getItemFromAsyncStorage(VDITOR_CACHE_KEY),
        ]);
        setAccessToken(token);
        console.log(userData);
        if (!userData || !token) {
          throw new Error('用户未登录');
        }
        setAuthKey(token);
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

  const createNewTag = async () => {
    if (!newTagName.trim()) {
      showToast('标签名称不能为空', "warning");
      return;
    }

    try {
      setIsUploading(true);
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/tags`,
        { tag_name: newTagName },
        { headers: { Authorization: `Bearer ${authKey}` } }
      );
    
      setNewTagName('');
      setShowAddTagModal(false);
      showToast("标签创建成功","success");
    } catch (error) {
      console.error('创建标签失败:', error);

      const status = error.response?.status;
      const message = error.response?.data?.message || '创建标签失败';

      if (status === 400) {
        showToast('请求参数错误，请检查输入', "error");
      } else if (status === 401) {
        showToast('登录已过期，请重新登录', "error");
      } else if (status === 422) {
        showToast(message, "error");
      } else if (status === 500) {
        showToast('服务器内部错误，请稍后再试', "error");
      } else {
        showToast('网络错误或服务器无响应', "error");
      }
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
      showToast('选择图片失败', "error");
    }
  };

  const uploadImage = async (uri, fileName = `photo_${Date.now()}.jpg`) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: fileName,
      });
      formData.append('bucketName', 'posts');

      const response = await api.post(`${BASE_INFO.BASE_URL}upload/quick`, formData, {
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
      setUploadProgress(0);
    }
  };

  const createPost = async () => {
    const now = Date.now();
    if (now - lastSubmitTimeRef.current < 5000) {
      showToast(`请等待 ${Math.ceil((5000 - (now - lastSubmitTimeRef.current)) / 1000)} 秒后再提交`,"warning");
      return;
    }

    if (!authKey) {
      showToast("请先登录","error");
      return;
    }

    if (!title || !vditorMarkdownContent) {
      showToast('标题和内容是必填项', "error");
      return;
    }

    try {
      setIsUploading(true);

      let coverImageUrl = null;
      if (coverImage) {
        const objectName = await uploadImage(coverImage);
        coverImageUrl = `${BASE_INFO.BASE_URL}dl/posts/${objectName}`;
      }

      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/posts`,
        {
          title,
          content: vditorMarkdownContent,
          cover_image_url: coverImageUrl,
          tagIds: selectedTags.tagIds,
        },
        {
          headers: { Authorization: `Bearer ${authKey}` },
        }
      );

      showToast("帖子创建成功","success");
      resetForm();
      lastSubmitTimeRef.current = now;
    } catch (error) {
      console.error('创建帖子失败:', error);

      const status = error.response?.status;
      const message = error.response?.data?.message || '创建帖子失败';

      if (status === 400) {
        showToast('请求参数错误，请检查输入', "error");
      } else if (status === 401) {
        showToast('登录已过期，请重新登录', "error");
      } else if (status === 422) {
        showToast(message, "error");
      } else if (status === 500) {
        showToast('服务器内部错误，请稍后再试', "error");
      } else {
        showToast('网络错误或服务器无响应', "error");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContentDisplay('');
    setVditorMarkdownContent('');
    setLocation('');
    setSelectedTags({
      tagIds: [],
      tags: []
    });
    setCoverImage(null);
    setTagSearch('');
    setUploadProgress(0);
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
      setShowVditorModal(false);
    } else if (message.type === 'UPLOAD_IMAGE') {
      try {
        showToast('图片上传功能需要配置文件保存逻辑，当前只接收数据。', "warning");
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
        showToast('Vditor图片上传失败',"error");
        
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
      <ScrollView className="flex-1 p-5">
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
          <Text className="dark:text-gray-600 text-gray-400 font-semibold">
            {contentDisplay ? '已编辑内容 (点击编辑)' : '点击编辑内容 *'}
          </Text>
          {contentDisplay ? (
            <Text className="mt-2 text-gray-700 dark:text-gray-300" numberOfLines={5}>
              {contentDisplay}
            </Text>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => cleanMDContent()}
          className="border border-gray-300 dark:border-gray-600 p-4 mb-3 rounded-lg items-center bg-gray-50 dark:bg-gray-700"
        >
          <Text className="text-gray-700 dark:text-gray-300">清空已编辑内容</Text>
        </TouchableOpacity>
        
        <FileUploader AccessToken={accessToken}/>

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
            resizeMode="cover"
          />
        )}
        
        {/* Tags Section */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">标签</Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => setShowTagSelection(true)}
                className="px-3 py-1 bg-blue-600 rounded-full"
              >
                <Text className="text-white text-sm">选择标签</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddTagModal(true)}
                className="px-3 py-1 ml-2 bg-green-600 rounded-full"
              >
                <Text className="text-white text-sm">+ 新建标签</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selected Tags Preview */}
          <View className="mb-4">
            <Text className="text-gray-500 text-sm dark:text-gray-300 mb-2">
              {selectedTags.tagIds.length > 0 ? 
                `已选 ${selectedTags.tagIds.length} 个标签` : 
                '选择标签'}
            </Text>

            {selectedTags.tagIds.length > 0 && (
              <View className="flex-row flex-wrap">
                {selectedTags.tags.map(tag => (
                  <View 
                    key={tag.tag_id}
                    className="px-2 py-1 m-1 rounded-full bg-blue-600"
                  >
                    <Text className="text-white text-xs">
                      {tag.tag_name}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Upload Progress */}
        {isUploading && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
            {uploadProgress > 0 && (
              <Text className="mt-1 text-gray-600 dark:text-gray-400">
                上传中: {uploadProgress}%
              </Text>
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
                  className={`px-4 py-2 rounded-lg ${
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
                if (webViewRef.current && vditorMarkdownContent) {
                  webViewRef.current.injectJavaScript(`
                    if (typeof vditorInstance !== 'undefined' && vditorInstance) {
                        vditorInstance.setValue(${JSON.stringify(vditorMarkdownContent || '')});
                    } else {
                        document.addEventListener('VDITOR_READY', () => {
                            vditorInstance.setValue(${JSON.stringify(vditorMarkdownContent || '')});
                        }, { once: true });
                    }
                    true;
                  `);
                }
              }}
            />
          </View>
        </Modal>
        
        <TagSelectionToast
          visible={showTagSelection}
          onClose={() => setShowTagSelection(false)}
          onConfirm={handleTagSelection}
          initialSelectedTags={selectedTags.tagIds}
        />
      </ScrollView>
    </View>
  );
};

export default UploaderScreen;