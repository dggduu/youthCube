import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Modal,TextInput } from 'react-native';
import { getItemFromAsyncStorage,setItemToAsyncStorage } from "../../../utils/LocalStorage";
import { BASE_INFO } from "../../../constant/base";
import axios from "axios";
import InputBox from "../../../components/inputBox/inputBox";
import { useToast } from "../../../components/tip/ToastHooks";
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from 'nativewind';
import { useNavigation } from "@react-navigation/native";
import { GRADES } from "../../../constant/user";
import Icon from 'react-native-vector-icons/MaterialIcons';
import TagSelectionToast from "../../../components/TagSelectionToast";
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";

const api = axios.create();
setupAuthInterceptors(api);

const CreateTeam = () => {
  const { colorScheme } = useColorScheme();
  const { showToast } = useToast();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('mature');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState({
    tagIds: [],    // 选中的标签ID数组
    tags: []       // 选中的标签对象数组
  });
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [isAgreed, setIsAgreed] = useState(false);
  const [showTagSelection, setShowTagSelection] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  useEffect(() => {
    const checkUserTeam = async () => {
      const userData = await getItemFromAsyncStorage("user");
      if (userData?.team_id) {
        showToast("您已加入一个队伍，无法创建新队伍", "warning");
        navigation.goBack();
      }
      setUser(userData);
    };
    checkUserTeam();
  }, []);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      showToast("请输入标签名称", "warning");
      return;
    }

    try {
      const accessToken = await getItemFromAsyncStorage("accessToken");
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/tags`,
        { tag_name: newTagName },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      showToast("标签创建成功", "success");
      setShowCreateTagModal(false);
      setNewTagName('');

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
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = await getItemFromAsyncStorage("user");
        if (!userString) {
          setIsLoading(false);
          return;
        }

        const userObj = userString;
        const userId = userObj.id;

        const response = await api.get(
          `${BASE_INFO.BASE_URL}api/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${await getItemFromAsyncStorage("accessToken")}`
            }
          }
        );

        await setItemToAsyncStorage("user",response.data);
        if (response.data.team_id) {
          showToast("您已加入一个队伍，无法创建新队伍", "warning");
          navigation.popToTop();
        }
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (user?.team_id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 p-5">
        <Text className="text-lg text-gray-900 dark:text-white mb-4">
          您已加入一个队伍，无法创建新队伍
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTagSelection = (tagData) => {
    setSelectedTags({
      tagIds: tagData.tagIds || [],
      tags: tagData.tags || []
    });
  };

  const handleCreateTeam = async () => {
    if (!isAgreed) {
      showToast("请先同意用户协议", "warning");
      return;
    }
    if (!teamName.trim()) {
      showToast("请输入队伍名称", "warning");
      return;
    }
    if (!description.trim()) {
      showToast("请输入描述", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = await getItemFromAsyncStorage("accessToken");
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/teams`,
        {
          team_name: teamName,
          description,
          tagIds: selectedTags.tagIds,
          is_public: isPublic,
          grade: selectedGrade
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      showToast("队伍创建成功", "success");
      navigation.navigate("Invite", {
        team_id: response.data.team_id
      });
    } catch (error) {
      console.error('创建队伍失败:', error);

      const status = error.response?.status;
      const message = error.response?.data?.message || '创建队伍失败';

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
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 p-5 bg-white dark:bg-gray-900">
      {/* 帮助AI */}
      <TouchableOpacity
        onPress={() => navigation.navigate("AI")}
        style={{ zIndex: 1 }}
        className='h-14 w-14 bg-green-600 rounded-full absolute bottom-6 right-6 items-center justify-center'
      >
        <Icon name="help" size={20} color="#fff" />
      </TouchableOpacity>
      
      <ScrollView>
        {/* 队伍名称 */}
        <InputBox
          label="队伍名称"
          placeholder="请输入队伍名称"
          value={teamName}
          onChangeText={setTeamName}
          className="mb-4"
        />
        
        {/* 队伍描述 */}
        <InputBox
          label="队伍描述"
          placeholder="请输入队伍描述"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          className="mb-4"
        />
        
        {/* 适龄段选择 */}
        <View className="mb-5">
          <Text className="text-base font-medium mb-2 text-gray-900 dark:text-gray-300">适龄段</Text>
          <View className="rounded-lg border border-gray-300 overflow-hidden dark:border-gray-600">
            <Picker
              selectedValue={selectedGrade}
              onValueChange={(itemValue) => setSelectedGrade(itemValue)}
              style={{
                color: colorScheme === 'dark' ? 'white' : 'gray',
                backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
                height: 55,
              }}
              dropdownIconColor={colorScheme === 'dark' ? 'white' : 'black'}
              mode="dropdown"
            >
              {GRADES.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value} 
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* 公开/私有设置 */}
        <View className="mb-5">
          <Text className="text-base font-medium mb-2 text-gray-900 dark:text-gray-300">加入方式</Text>
          <View className="flex-row">
            <TouchableOpacity 
              className={`px-4 py-2 border rounded mr-2 ${isPublic ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}
              onPress={() => setIsPublic(true)}
            >
              <Text className={`${isPublic ? 'text-white' : 'text-gray-900 dark:text-gray-300'}`}>公开加入</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`px-4 py-2 border rounded ${!isPublic ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-300 dark:border-gray-600'}`}
              onPress={() => setIsPublic(false)}
            >
              <Text className={`${!isPublic ? 'text-white' : 'text-gray-900 dark:text-gray-300'}`}>仅邀请</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 标签选择 */}
        <View className="mb-5">
          <Text className="text-base font-medium mb-2 text-gray-900 dark:text-white">选择标签</Text>
          <View className='flex-row'>
            <TouchableOpacity 
              onPress={() => setShowTagSelection(true)}
              className="px-3 py-2 bg-blue-500 rounded-full mb-2 mr-3"
            >
              <Text className="text-white text-sm">
                {selectedTags.tagIds.length > 0 ? 
                  `已选 ${selectedTags.tagIds.length} 个标签` : 
                  '选择标签'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowCreateTagModal(true)}
              className="px-3 py-2 bg-green-500 rounded-full mb-2"
            >
              <Text className="text-white text-sm">新建标签</Text>
            </TouchableOpacity>
          </View>
          
          {/* 显示已选标签 */}
          {selectedTags.tagIds.length > 0 && (
            <View className="flex-row flex-wrap">
              {selectedTags.tags.map(tag => (
                <View 
                  key={tag.tag_id}
                  className="px-3 py-2 m-1 rounded-full bg-blue-500"
                >
                  <Text className="text-white text-sm">
                    {tag.tag_name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* 用户协议确认 */}
        <View className="flex-row items-center mt-4 mb-6">
          <TouchableOpacity
            onPress={() => setIsAgreed(!isAgreed)}
            className="mr-2 items-center"
          >
            <View className={`w-5 h-5 rounded border items-center justify-center ${isAgreed ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
              {isAgreed && <Icon name="check" size={12} color="white" />}
            </View>
          </TouchableOpacity>
          <Text className="text-gray-600 dark:text-gray-300">
            我已阅读并同意
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Safe')}>
            <Text className="text-blue-500 font-bold">《户外活动安全声明》</Text>
          </TouchableOpacity>
        </View>

        {/* 创建按钮 */}
        <TouchableOpacity 
          className={`py-4 rounded-lg items-center mt-5 mb-10 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleCreateTeam}
          disabled={isLoading}
        >
          <Text className="text-white text-lg font-bold">
            {isLoading ? '创建中...' : '创建队伍'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {/* 创建标签模态框 */}
      <Modal
        visible={showCreateTagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateTagModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-4/5 bg-white dark:bg-gray-800 rounded-lg p-6">
            <Text className="text-lg font-bold dark:text-white mb-4">创建新标签</Text>
            
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded p-3 mb-4 dark:text-white dark:bg-gray-700"
              placeholder="输入标签名称"
              placeholderTextColor="#9CA3AF"
              value={newTagName}
              onChangeText={setNewTagName}
              style={{height:50}}
              autoFocus
            />
            
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-2 mr-2"
                onPress={() => setShowCreateTagModal(false)}
              >
                <Text className="dark:text-white">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-blue-500 rounded"
                onPress={handleCreateTag}
              >
                <Text className="text-white">创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 标签选择弹窗 */}
      <TagSelectionToast
        visible={showTagSelection}
        onClose={() => setShowTagSelection(false)}
        onConfirm={handleTagSelection}
        initialSelectedTags={selectedTags.tagIds}
      />
    </View>
  );
};

export default CreateTeam;