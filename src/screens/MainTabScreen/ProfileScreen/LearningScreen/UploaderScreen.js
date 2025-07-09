import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, ScrollView, Modal } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { getItemFromAsyncStorage } from "../../../../utils/LocalStorage"
import axios from 'axios'
import { BASE_INFO } from "../../../../constant/base"
import { useColorScheme } from 'nativewind'

const UploaderScreen = () => {
  const { colorScheme, toggleColorScheme } = useColorScheme()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [coverImage, setCoverImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [availableTags, setAvailableTags] = useState([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [authKey, setAuthKey] = useState(null)
  const [error, setError] = useState(null)
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')

  // 加载认证数据和标签
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, token] = await Promise.all([
          getItemFromAsyncStorage('user'),
          getItemFromAsyncStorage('accessToken')
        ])
        
        if (!userData || !token) {
          throw new Error('用户未登录')
        }
        console.log(userData);
        setAuthKey(token)
        await fetchTags(token)
      } catch (e) {
        setError(e.message)
      }
    }

    loadData()
  }, [])

  // 获取标签列表
  const fetchTags = async (token) => {
    try {
      setIsLoadingTags(true)
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/tags`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAvailableTags(response.data)
    } catch (error) {
      console.error('获取标签失败:', error)
      setError('加载标签失败')
    } finally {
      setIsLoadingTags(false)
    }
  }

  // 创建新标签
  const createNewTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert('错误', '标签名称不能为空')
      return
    }

    try {
      setIsUploading(true)
      const response = await axios.post(
        `${BASE_INFO.BASE_URL}api/tags`,
        { tag_name: newTagName },
        { headers: { Authorization: `Bearer ${authKey}` } }
      )

      setAvailableTags([...availableTags, response.data.tag])
      setSelectedTags([...selectedTags, response.data.tag.tag_id])
      setNewTagName('')
      setShowAddTagModal(false)
      Alert.alert('成功', '标签创建成功')
    } catch (error) {
      console.error('创建标签失败:', error)
      Alert.alert('错误', error.response?.data?.message || '创建标签失败')
    } finally {
      setIsUploading(false)
    }
  }

  // 过滤标签
  const filteredTags = availableTags.filter(tag =>
    tag.tag_name.toLowerCase().includes(tagSearch.toLowerCase())
  )

  // 选择封面图片
  const selectCoverImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      })

      if (result.assets && result.assets[0].uri) {
        setCoverImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error('选择图片失败:', error)
      Alert.alert('错误', '选择图片失败')
    }
  }

  // 上传图片到服务器
  const uploadImage = async (uri) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      const file = {
        uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      }
      formData.append('file', file)
      formData.append('bucketName', 'posts')

      const response = await axios.post(`${BASE_INFO.BASE_URL}api/upload/quick`, formData, {
        headers: {
          'Authorization': `Bearer ${authKey}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / (progressEvent.total || 1)) * 100)
          setUploadProgress(progress)
        },
      })

      return response.data.objectName
    } catch (error) {
      console.error('上传失败:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  // 创建帖子
  const createPost = async () => {
    if (!authKey) {
      Alert.alert('错误', '请先登录')
      return
    }

    if (!title || !content) {
      Alert.alert('错误', '标题和内容是必填项')
      return
    }

    try {
      setIsUploading(true)
      
      let coverImageUrl = null
      if (coverImage) {
        const objectName = await uploadImage(coverImage)
        coverImageUrl = `${BASE_INFO.BASE_URL}api/upload/dl/posts/${objectName}`
      }
      
      const response = await axios.post(
        `${BASE_INFO.BASE_URL}api/posts`,
        {
          title,
          content,
          cover_image_url: coverImageUrl,
          tagIds: selectedTags,
        },
        {
          headers: { Authorization: `Bearer ${authKey}` },
        }
      )

      Alert.alert('成功', '帖子创建成功')
      resetForm()
    } catch (error) {
      console.error('创建帖子失败:', error)
      Alert.alert('错误', error.response?.data?.message || '创建帖子失败')
    } finally {
      setIsUploading(false)
    }
  }

  // 重置表单
  const resetForm = () => {
    setTitle('')
    setContent('')
    setLocation('')
    setSelectedTags([])
    setCoverImage(null)
    setTagSearch('')
  }

  // 切换标签选择状态
  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

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
    )
  }

  if (!authKey) {
    return (
      <View className="flex-1 items-center justify-center p-5 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
        <Text className="mt-4 text-gray-700 dark:text-gray-300">加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 p-5 dark:bg-gray-900">

      <Text className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">创建新帖子(调试端点用)</Text>
      
      {/* Title Input */}
      <TextInput
        placeholder="标题 *"
        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
        value={title}
        onChangeText={setTitle}
        className="border border-gray-300 dark:border-gray-600 p-3 mb-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />
      
      {/* Content Input */}
      <TextInput
        placeholder="内容 *"
        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        className="border border-gray-300 dark:border-gray-600 p-3 mb-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-32"
      />
      
      {/* Location Input */}
      {/* <TextInput
        placeholder="位置 (可选)"
        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
        value={location}
        onChangeText={setLocation}
        className="border border-gray-300 dark:border-gray-600 p-3 mb-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      /> */}
      
      {/* Cover Image Upload */}
      <TouchableOpacity
        onPress={selectCoverImage}
        className="border border-gray-300 dark:border-gray-600 p-4 mb-4 rounded-lg items-center bg-gray-50 dark:bg-gray-700"
      >
        <Text className="text-gray-700 dark:text-gray-300">
          {coverImage ? '更换封面图片' : '选择封面图片'}
        </Text>
      </TouchableOpacity>
      
      {coverImage && (
        <Image
          source={{ uri: coverImage }}
          className="w-full h-48 mb-4 rounded-lg"
        />
      )}
      
      {/* Tags Selection */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">标签</Text>
        <TouchableOpacity 
          onPress={() => setShowAddTagModal(true)}
          className="px-3 py-1 bg-green-500 rounded-full"
        >
          <Text className="text-white">+ 新建标签</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tag Search */}
      {/* <TextInput
        placeholder="搜索标签..."
        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
        value={tagSearch}
        onChangeText={setTagSearch}
        className="border border-gray-300 dark:border-gray-600 p-3 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      /> */}
      
      {isLoadingTags ? (
        <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
      ) : (
        <View className="flex-row flex-wrap mb-4">
          {filteredTags.map(tag => (
            <TouchableOpacity
              key={tag.tag_id}
              onPress={() => toggleTag(tag.tag_id)}
              className={`px-3 py-2 m-1 rounded-full ${
                selectedTags.includes(tag.tag_id) 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <Text className={`${
                selectedTags.includes(tag.tag_id)
                  ? 'text-white'
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
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
            {selectedTags.map(tagId => {
              const tag = availableTags.find(t => t.tag_id === tagId)
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
              ) : null
            })}
          </View>
        </View>
      )}
      
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
        disabled={isUploading}
        className={`p-4 rounded-lg items-center ${
          isUploading ? 'bg-gray-400' : 'bg-blue-600'
        }`}
      >
        <Text className="text-white font-bold">
          {isUploading ? '正在创建...' : '创建帖子'}
        </Text>
      </TouchableOpacity>

      {/* 添加标签模态框 */}
      <Modal
        visible={showAddTagModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddTagModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-5">
          <View className="w-full bg-white dark:bg-gray-800 p-5 rounded-lg">
            <Text className="text-xl font-bold mb-4 text-gray-900 dark:text-white">新建标签</Text>
            
            <TextInput
              placeholder="标签名称"
              placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
              value={newTagName}
              onChangeText={setNewTagName}
              className="border border-gray-300 dark:border-gray-600 p-3 mb-4 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setShowAddTagModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
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
    </ScrollView>
  )
}

export default UploaderScreen