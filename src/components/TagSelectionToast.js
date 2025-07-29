import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BASE_INFO } from '../constant/base';
import { useColorScheme } from 'nativewind';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
  const pageSize = 10;

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
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/tags`, {
        params: {
          page: pageNum,
          size: pageSize,
        },
      });
      
      const { items, totalPages } = response.data;
      setAvailableTags(items || []);
      setTotalPages(totalPages || 1);
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

  const renderTagItem = ({ item }) => {
    const isSelected = Array.isArray(selectedTags) && selectedTags.includes(item.tag_id);
    return (
      <TouchableOpacity
        onPress={() => toggleTag(item.tag_id)}
        className={`
          px-3 py-2 m-1 rounded-full
          ${isSelected
            ? 'bg-blue-600'
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
          {item.tag_name}
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
            <FlatList
              data={availableTags}
              renderItem={renderTagItem}
              keyExtractor={(item) => item.tag_id.toString()}
              contentContainerStyle={{ paddingBottom: 15 }}
              numColumns={3}
            />
          )}
          
          <View className="flex-row justify-between mt-5">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 mx-2"
            >
              <Text className="text-center font-semibold text-gray-800 dark:text-gray-200">取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 py-3 rounded-lg bg-blue-600 mx-2"
            >
              <Text className="text-center font-semibold text-white">确定 ({selectedTags.length})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TagSelectionToast;