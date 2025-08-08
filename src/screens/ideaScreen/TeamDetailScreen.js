import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Modal, TextInput, useColorScheme, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { BASE_INFO } from '../../constant/base';
import { GRADES, PartyGrade } from '../../constant/user';
import { getItemFromAsyncStorage, setItemToAsyncStorage } from "../../utils/LocalStorage";
import { navigate } from "../../navigation/NavigatorRef";
import { useToast } from "../../components/tip/ToastHooks";
import FastImage from 'react-native-fast-image';
import InputBox from "../../components/inputBox/inputBox";
import axios from 'axios';
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";

const api = axios.create();
setupAuthInterceptors(api);

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width - 32;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 3) / 4;

const TeamDetailScreen = () => {
  const route = useRoute();
  const { showToast } = useToast();
  const { teamId, teamName } = route.params || {};
  const isDark = useColorScheme() === 'dark';
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    email: '',
    description: ''
  });
  const navigation = useNavigation();
  const [userId, setUserId] = useState('');
  const [associatedArticles, setAssociatedArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [lastApplicationTime, setLastApplicationTime] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigate('MainTabNavigator', { screen: '想法市场' })}
          className="mr-4"
        >
          <MaterialIcons 
            name="home" 
            size={24} 
            color={isDark ? "#e5e7eb" : "#1f2937"} 
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDark]);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await api.get(
          `${BASE_INFO.BASE_URL}api/teams/${teamId}`
        );

        const result = response.data;

        setTeamData(result);
        console.log(result);

        if (result.projectResults && result.projectResults.length > 0) {
          fetchAssociatedArticles(result.projectResults);
        }

        const lastApply = await getItemFromAsyncStorage(
          `lastApply_${teamId}`
        );
        setLastApplicationTime(lastApply ? parseInt(lastApply) : null);
      } catch (err) {
        let errorMessage = '获取团队信息失败';

        if (err.response && err.response.data) {
          errorMessage = err.response.data.message || errorMessage;
        } else if (err.request) {
          errorMessage = '网络错误，请检查您的连接';
        } else {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    const loadUserID = async()=>{
      const user = await getItemFromAsyncStorage('user');
      setUserId(user.id);
    }
    fetchTeamDetails();
    loadUserID();
  }, [teamId]);

  const fetchAssociatedArticles = async (projectResults) => {
    setArticlesLoading(true);
    try {
      const articleResults = projectResults.filter(pr => pr.type === 'article' && pr.post_id);
      const articles = await Promise.all(
        articleResults.map(async (result) => {
          const response = await api.get(`${BASE_INFO.BASE_URL}api/posts/${result.post_id}`);
          return response.data;
        })
      );
      setAssociatedArticles(articles.filter(article => article !== null));
    } catch (err) {
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleApplyToJoin = async () => {
    const now = Date.now();
    
    if (lastApplicationTime && (now - lastApplicationTime) < 5 * 60 * 1000) {
      const remainingMinutes = Math.ceil((5 * 60 * 1000 - (now - lastApplicationTime)) / (60 * 1000));
      showToast(`请等待 ${remainingMinutes} 分钟后再提交申请`, "warning");
      return;
    }

    if (!applicationData.email.trim()) {
      showToast('请输入邮箱', "warning");
      return;
    }
    if (!applicationData.description.trim()) {
      showToast('请输入申请描述', "warning");
      return;
    }

    setIsApplying(true);
    
    try {
      const accessToken = await getItemFromAsyncStorage("accessToken");

      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/invite/team`,
        {
          team_id: teamId,
          email: applicationData.email,
          description: applicationData.description,
          user_id:userId
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status >= 200 && status < 300 || status === 201
        }
      );

      const successTime = Date.now();
      
      setShowApplyModal(false);
      setApplicationData({ email: '', description: '' });
      setLastApplicationTime(successTime);
      
      try {
        await setItemToAsyncStorage(`lastApply_${teamId}`, successTime.toString());
      } catch (storageError) {
        console.error('存储申请时间失败:', storageError);
      }
      
      showToast("申请发送成功", "success");
      
      const timer = setTimeout(() => {
        setLastApplicationTime(null);
        setItemToAsyncStorage(`lastApply_${teamId}`, ' ');
      }, 5 * 60 * 1000);

      return () => clearTimeout(timer);

    } catch (err) {
      console.error('申请请求失败:', err);
      
      let errorMessage = '申请发送失败';
      if (err.response) {
        errorMessage = err.response.data?.message || `服务器错误: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = '网络错误，请检查连接';
      } else {
        errorMessage = err.message || '未知错误';
      }
      
      showToast(errorMessage, "error");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text className="mt-4 text-[#f56c6c] dark:text-red-400 text-lg">加载失败: {error}</Text>
      </View>
    );
  }

  const gradeLabel = GRADES.find(grade => grade.value === teamData.grade)?.label || '未知';

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Main Team Card */}
      <View className="m-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <View className="p-5">
          {teamData?.img_url && (
            <View className="mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
              <FastImage
                source={{ uri: teamData.img_url }}
                style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>
          )}
          
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-3">
              <Text 
                className="text-2xl font-bold text-gray-800 dark:text-white mb-2" 
                style={{ fontFamily: "NotoSerifSC" }}
                numberOfLines={2}
              >
                {teamData.team_name}
              </Text>
              <View className="flex-row items-center">
                <MaterialIcons name="date-range" size={16} color="#6b7280" />
                <Text className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  创建于 {new Date(teamData.create_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View className="flex-col">
              <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-t-lg flex-row">
                <MaterialIcons name="grade" size={16} color="#1d4ed8"  />
                <Text className="text-blue-800 dark:text-blue-100 text-sm font-medium ml-1">
                  {gradeLabel}
                </Text>
              </View>
              
              <View className={`${teamData.is_public ? 'bg-green-100 dark:bg-green-900' : 'bg-purple-100 dark:bg-purple-900'} px-3 py-1.5 rounded-b-lg flex-row`}>
                <MaterialIcons 
                  name={teamData.is_public ? "public" : "lock"} 
                  size={16} 
                  color={teamData.is_public ? "#166534" : "#6b21a8"} 
                />
                <Text className={`ml-1 ${teamData.is_public ? 'text-green-800 dark:text-green-100' : 'text-purple-800 dark:text-purple-100'} text-sm font-medium`}>
                  {teamData.is_public ? '公开团队' : '私密团队'}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            className={`mt-4 py-3 rounded-md flex-row justify-center items-center ${
              teamData.chatRoom.members?.some(member => member.user_id === userId)
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'bg-[#409eff] dark:bg-blue-600'
            }`}
            onPress={() => !teamData.chatRoom?.members?.some(member => member.user_id === userId) && setShowApplyModal(true)}
            disabled={teamData.chatRoom?.members?.some(member => member.user_id === userId)}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={teamData.chatRoom?.members?.some(member => member.user_id === userId) ? "check" : "send"} 
              size={20} 
              color={teamData.chatRoom?.members?.some(member => member.user_id === userId) 
                ? (isDark ? "#9ca3af" : "#6b7280") 
                : "white"} 
            />
            <Text className={`font-medium ml-1  ${
              teamData.chatRoom?.members?.some(member => member.user_id === userId)
                ? 'text-gray-600 dark:text-gray-300'
                : 'text-white'
            }`}>
              {teamData.chatRoom?.members?.some(member => member.user_id === userId)
                ? '已是成员'
                : '申请加入'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="h-px bg-gray-200 dark:bg-gray-700 mx-5" />
        
        {teamData.tags?.length > 0 && (
          <View className="px-5 py-4">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="tag" size={20} color="#3b82f6" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-800 dark:text-white"> 团队标签</Text>
            </View>
            <View className="flex-row flex-wrap">
              {teamData.tags.map((tag) => (
                <TouchableOpacity
                  key={tag.tag_id}
                  onPress={() => navigation.navigate("Tag", { tagId: tag.tag_id })}
                  className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full mr-2 mb-2 border border-blue-100 dark:border-blue-800 flex-row items-center"
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="label" size={14} color="#3b82f6" className="mr-1" />
                  <Text className="text-blue-600 dark:text-blue-300 text-sm font-medium">{tag.tag_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Description Card */}
        <View className="px-5 py-4">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="description" size={20} color="#3b82f6" className="mr-2" />
            <Text className="text-lg font-semibold text-gray-800 dark:text-white"> 团队描述</Text>
          </View>
          <Text className="text-gray-700 dark:text-gray-300 leading-6">
            {teamData.description || "暂无描述"}
          </Text>
        </View>
      </View>

      {/* Members Card */}
      <View className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <View className="p-5">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="people" size={20} color="#3b82f6" className="mr-2" />
            <Text className="text-lg font-semibold text-gray-800 dark:text-white"> 团队成员</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              （{teamData.chatRoom.members.length}人）
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="pb-2"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <View className="flex-row space-x-3">
              {teamData.chatRoom.members.map((member, index) => (
                <TouchableOpacity
                  key={index}
                  className="py-2 px-4 items-center rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 min-w-[120px]"
                  onPress={() => navigation.navigate("profile", {
                    team_id: teamData.team_id,
                    user_id: member.user_id,
                    user_name: member.name
                  })}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center mb-1">
                    <MaterialIcons
                      name={member.role === 'member' ? 'person' : 'star'}
                      color={isDark ? "#3b82f6" : "#2563eb"}
                      size={18}
                      className="mr-1"
                    />
                    <Text className="text-gray-800 dark:text-white font-medium text-sm">
                      {member.name}
                    </Text>
                  </View>
                  <Text className="text-gray-600 dark:text-gray-300 text-xs">
                    {PartyGrade.find(role => role.value === member.role)?.grade || member.role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Articles Card */}
      {articlesLoading ? (
        <View className="mx-4 my-6 p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text className="mt-2 text-gray-500 dark:text-gray-400">加载文章中...</Text>
        </View>
      ) : associatedArticles.length > 0 && (
        <View className="mx-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <View className="p-5">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="article" size={20} color="#3b82f6" className="mr-2" />
              <Text className="text-lg font-semibold text-gray-800 dark:text-white">团队文章</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({associatedArticles.length}篇)
              </Text>
            </View>
            {associatedArticles.map((article) => (
              <TouchableOpacity
                key={article.post_id}
                onPress={() => navigation.navigate("Post", {
                  screen: "PostDetail",
                  params: { postId: article.post_id }
                })}
                className="mb-4 p-4 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                activeOpacity={0.7}
              >
                <Text className="text-lg font-bold text-gray-800 dark:text-white mb-1">{article.title}</Text>
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="person" size={14} color="#6b7280" className="mr-1" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    作者: {article.author?.name || '未知'}
                  </Text>
                  <MaterialIcons name="schedule" size={14} color="#6b7280" className="ml-3 mr-1" />
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(article.create_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-gray-600 dark:text-gray-300" numberOfLines={2}>
                  {article.content?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Apply Modal */}
      <Modal
        visible={showApplyModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <View className="p-5 border-b border-gray-200 dark:border-gray-700 flex-row items-center">
              <Text className="text-xl font-bold text-gray-800 dark:text-white">申请加入团队</Text>
            </View>
            
            <View className="p-5">

                  <InputBox
                  label="邮箱"
                    placeholder="请输入您的邮箱"
                    value={applicationData.email}
                    onChangeText={(text) => setApplicationData({...applicationData, email: text})}
                    leftIconName="email"
                  />
                  <InputBox
                  label="申请理由"
                    placeholder="请说明您想加入的原因"
                    value={applicationData.description}
                    onChangeText={(text) => setApplicationData({...applicationData, description: text})}
                    multiline
                  />
                </View>
            
            <View className="p-4 border-t border-gray-200 dark:border-gray-700 flex-row justify-end space-x-3">
              <TouchableOpacity
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md flex-row items-center"
                onPress={() => setShowApplyModal(false)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 dark:text-gray-300 font-medium">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-[#409eff] dark:bg-blue-600 rounded-md flex-row items-center ml-3"
                onPress={handleApplyToJoin}
                disabled={isApplying}
                activeOpacity={0.7}
              >
                {isApplying ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-medium">提交申请</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default TeamDetailScreen;