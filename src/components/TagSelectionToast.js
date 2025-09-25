import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_INFO } from '../constant/base';
import { useColorScheme } from 'nativewind';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import setupAuthInterceptors from "../utils/axios/AuthInterceptors";
import { useToast } from '../components/tip/ToastHooks';

const api = axios.create();
setupAuthInterceptors(api);

const TagSelectionToast = ({
  visible,
  onClose,
  onConfirm,
  initialSelectedTags = [],
}) => {
  const { colorScheme } = useColorScheme();
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(
    Array.isArray(initialSelectedTags) ? initialSelectedTags : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const pageSize = 10;
  const { showToast } = useToast();

  useEffect(() => {
    if (visible) {
      setCurrentPage(0);
      setAvailableTags([]);
      fetchTags(0);
    }
  }, [visible]);

  const fetchTags = async (pageNum) => {
    try {
      setIsLoading(true);
      const response = await api.get(`${BASE_INFO.BASE_URL}api/tags`, {
        params: {
          page: pageNum,
          size: pageSize,
        },
      });
      
      const { items, totalPages } = response.data;
      setAvailableTags(items || []);
      setTotalPages(totalPages || 1);
      console.log(items);
    } catch (error) {
      console.error('获取标签失败:', error);
      setAvailableTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return prevArray.includes(tagId) 
        ? prevArray.filter((id) => id !== tagId) 
        : [...prevArray, tagId];
    });
  };

  const handleConfirm = () => {
    const currentSelected = Array.isArray(selectedTags) ? selectedTags : [];
    const selectedTagObjects = availableTags.filter(tag => 
      currentSelected.includes(tag.tag_id)
    );
    onConfirm({
      tagIds: currentSelected,
      tags: selectedTagObjects
    });
    onClose();
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 0 && pageNum < totalPages && pageNum !== currentPage) {
      setCurrentPage(pageNum);
      fetchTags(pageNum);
    }
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) {
      showToast('标签名称不能为空', "error");
      return;
    }

    if (newTagName.length > 50) {
      showToast('标签名称不能超过50个字符', "error");
      return;
    }

    try {
      setIsUploading(true);
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/tags`,
        { tag_name: newTagName }
      );
      
      const newTag = response.data;
      
      setNewTagName('');
      setShowAddTagModal(false);
      showToast('标签创建成功', "success");
      
      setCurrentPage(0);
      fetchTags(0);
      
    } catch (error) {
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

  const keyExtractor = (item) => {
    return item.tag_id ? item.tag_id.toString() : Math.random().toString();
  };

  const renderTagItem = ({ item }) => {
    const isSelected = Array.isArray(selectedTags) && selectedTags.includes(item.tag_id);
    const displayName = item.tag_name.length > 20 
      ? `${item.tag_name.substring(0, 20)}...` 
      : item.tag_name;
    
    return (
      <TouchableOpacity
        onPress={() => toggleTag(item.tag_id)}
        className={`
          px-3 py-2 m-1 rounded-full
          ${isSelected
            ? 'bg-[#409eff]'
            : colorScheme === 'dark' 
              ? 'bg-gray-700' 
              : 'bg-gray-200'
          }
        `}
      >
        <Text 
          className={`
            text-sm
            ${isSelected
              ? 'text-white'
              : colorScheme === 'dark'
                ? 'text-gray-200'
                : 'text-gray-800'
            }
          `}
        >
          {displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPaginationControls = () => (
    <View className="flex-row justify-center items-center my-4">
      <TouchableOpacity 
        onPress={() => goToPage(0)}
        disabled={currentPage === 0}
        className="p-2"
      >
        <MaterialIcons 
          name="first-page" 
          size={24} 
          color={currentPage === 0 ? (colorScheme === 'dark' ? '#6b7280' : '#9ca3af') : (colorScheme === 'dark' ? 'white' : 'black')} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => goToPage(currentPage - 1)}
        disabled={currentPage === 0}
        className="p-2"
      >
        <MaterialIcons 
          name="chevron-left" 
          size={24} 
          color={currentPage === 0 ? (colorScheme === 'dark' ? '#6b7280' : '#9ca3af') : (colorScheme === 'dark' ? 'white' : 'black')} 
        />
      </TouchableOpacity>
      
      <Text className="mx-4 text-gray-800 dark:text-gray-200">
        第 {currentPage + 1} 页 / 共 {totalPages} 页
      </Text>
      
      <TouchableOpacity 
        onPress={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2"
      >
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={currentPage === totalPages - 1 ? (colorScheme === 'dark' ? '#6b7280' : '#9ca3af') : (colorScheme === 'dark' ? 'white' : 'black')} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => goToPage(totalPages - 1)}
        disabled={currentPage === totalPages - 1}
        className="p-2"
      >
        <MaterialIcons 
          name="last-page" 
          size={24} 
          color={currentPage === totalPages - 1 ? (colorScheme === 'dark' ? '#6b7280' : '#9ca3af') : (colorScheme === 'dark' ? 'white' : 'black')} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`w-[90%] max-h-[80%] rounded-xl p-5 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-4 text-center ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              选择标签
            </Text>
            
            {renderPaginationControls()}
            
            {isLoading ? (
              <ActivityIndicator size="large" color={colorScheme === 'dark' ? 'white' : 'black'} />
            ) : (
              <ScrollView 
                contentContainerStyle={{ 
                  paddingBottom: 15,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {availableTags.map((item) => (
                  <View key={keyExtractor(item)} style={{ margin: 1 }}>
                    {renderTagItem({ item })}
                  </View>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              onPress={() => setShowAddTagModal(true)}
              className="mb-4 p-3 rounded-md border border-dashed border-gray-400 dark:border-gray-500 flex-row items-center justify-center"
            >
              <MaterialIcons 
                name="add" 
                size={20} 
                color={colorScheme === 'dark' ? 'white' : 'black'} 
              />
              <Text className="ml-2 text-gray-800 dark:text-gray-200">添加标签</Text>
            </TouchableOpacity>
            
            <View className="flex-row justify-between mt-5">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 mx-2"
              >
                <Text className="text-center font-semibold text-gray-800 dark:text-gray-200">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                className="flex-1 py-3 rounded-lg bg-[#409eff] mx-2"
              >
                <Text className="text-center font-semibold text-white">确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddTagModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddTagModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`w-[80%] rounded-xl p-5 ${colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-4 ${colorScheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              新建标签
            </Text>
            
            <TextInput
              placeholder="输入标签名称 (最多50个字符)"
              value={newTagName}
              onChangeText={(text) => {
                if (text.length <= 50) {
                  setNewTagName(text);
                }
              }}
              maxLength={50}
              style={{height: 50}}
              className={`border rounded-md p-3 mb-2 ${colorScheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}
              placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
            />
            <Text className={`text-xs mb-4 ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              已输入 {newTagName.length}/50 个字符
            </Text>
            
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setShowAddTagModal(false)}
                className="px-4 py-2 rounded-md mr-2"
              >
                <Text className="text-gray-800 dark:text-gray-200">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createNewTag}
                disabled={isUploading}
                className="px-4 py-2 rounded-md bg-[#409eff]"
              >
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white">确认</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TagSelectionToast;