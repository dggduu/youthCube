import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity,Text } from 'react-native';
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import { BASE_INFO } from "../../../constant/base";
import axios from "axios";
import InputBox from "../../../components/inputBox/inputBox";
import { useToast } from "../../../components/tip/ToastHooks";
import { Picker } from '@react-native-picker/picker';
import { useColorScheme } from 'nativewind';
import { useNavigation } from "@react-navigation/native";
import { GRADES } from "../../../constant/user";
import Icon from 'react-native-vector-icons/MaterialIcons';
const CreateTeam = () => {
  const { colorScheme } = useColorScheme();
  const { showToast } = useToast();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('mature');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [isAgreed, setIsAgreed] = useState(false);
  // 初始化时检查用户是否已有队伍
  useEffect(() => {
    const checkUserTeam = async () => {
      const userData = await getItemFromAsyncStorage("user");
      setUser(userData);
      
      // if (userData?.team_id) {
      //   showToast("您已加入一个队伍，无法创建新队伍", "warning");
      //   navigation.goBack();
      // }
    };
    
    checkUserTeam();
  }, []);

  // 获取所有标签
  const fetchTags = async () => {
    try {
      const accessToken = await getItemFromAsyncStorage("accessToken");
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/tags`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          page: 0,
          size: 20
        }
      });
      setAllTags(response.data);
    } catch (error) {
      showToast("获取标签失败", "error");
    }
  };

  // 创建队伍
  const handleCreateTeam = async () => {
    if (!isAgreed) {
      showToast("请先同意用户协议", "warning");
      return;
    }
    if (!teamName.trim()) {
      showToast("请输入队伍名称", "warning");
      return;
    }

    setIsLoading(true);
    try {
      // const accessToken = await getItemFromAsyncStorage("accessToken");
      // const response = await axios.post(
      //   `${BASE_INFO.BASE_URL}api/teams`,
      //   {
      //     team_name: teamName,
      //     description,
      //     tagIds: selectedTags.map(tag => tag.tag_id),
      //     is_public: isPublic,
      //     grade: selectedGrade
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`
      //     }
      //   }
      // );
      showToast("队伍创建成功", "success");
      navigation.navigate("Invite", {
        // team_id: response.data.team_id
        team_id: 19
      });
    } catch (error) {
      showToast("创建队伍失败", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 标签选择切换
  const toggleTagSelection = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.tag_id === tag.tag_id);
      if (isSelected) {
        return prev.filter(t => t.tag_id !== tag.tag_id);
      } else {
        return [...prev, tag];
      }
    });
  };

  // // 如果用户已有队伍，则不显示创建界面
  // if (user?.team_id) {
  //   return (
  //     <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 p-5">
  //       <Text className="text-lg text-gray-900 dark:text-white mb-4">
  //         您已加入一个队伍，无法创建新队伍
  //       </Text>
  //       <TouchableOpacity
  //         className="bg-blue-500 px-6 py-3 rounded-lg"
  //         onPress={() => navigation.goBack()}
  //       >
  //         <Text className="text-white font-medium">返回</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <ScrollView className="flex-1 p-5 bg-white dark:bg-gray-900">
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
                  height:55,
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
        <TouchableOpacity 
          onPress={fetchTags} 
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl self-start mb-3 border border-gray-300 dark:border-gray-600"
        >
          <Text className="text-blue-500 dark:text-blue-400">加载标签</Text>
        </TouchableOpacity>
        <View className="flex-row flex-wrap">
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag.tag_id}
              className={`px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 mr-2 mb-2 ${selectedTags.some(t => t.tag_id === tag.tag_id) 
                ? 'bg-blue-500' 
                : 'bg-gray-100 dark:bg-gray-800'}`}
              onPress={() => toggleTagSelection(tag)}
            >
              <Text className={`${selectedTags.some(t => t.tag_id === tag.tag_id) 
                ? 'text-white' 
                : 'text-gray-900 dark:text-gray-300'}`}>
                {tag.tag_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* 用户协议确认 */}
      <View className="flex-row items-center mt-4 mb-6">
        <TouchableOpacity
          onPress={() => setIsAgreed(!isAgreed)}
          className="mr-2 items-center"
        >
          <View className={`w-5 h-5 rounded border items-center justify-center ${isAgreed ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
            {isAgreed && (
              <Icon name="check" size={12} color="white" />
            )}
          </View>
        </TouchableOpacity>
        <Text className="text-gray-600 dark:text-gray-300">
          我已阅读并同意
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Safe')}>
          <Text className="text-blue-500">《户外活动安全声明》</Text>
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
  );
};

export default CreateTeam;