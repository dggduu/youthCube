import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, ToastAndroid, Modal, TextInput, useColorScheme } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../constant/base';
import { GRADES, PartyGrade } from '../../constant/user';
import { getItemFromAsyncStorage, setItemInAsyncStorage } from "../../utils/LocalStorage";
import { Screen } from 'react-native-screens';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { navigate } from "../../navigation/NavigatorRef";
const TeamDetailScreen = () => {
  const route = useRoute();
  const { teamId, teamName } = route.params || {};
  const isDark = useColorScheme() == 'dark';
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

  useLayoutEffect(()=>{
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => navigate('MainTabNavigator', { screen: '想法市场'})}
            style={{ marginRight: 10 }}
          >
            <MaterialIcons name="home" size={24} color={isDark ? "#eee" : "#333"}/>
          </TouchableOpacity>
        </View>
      ),
    });
  },[navigation]);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const response = await fetch(`${BASE_INFO.BASE_URL}api/teams/${teamId}`);
        if (!response.ok) throw new Error('加载失败');
        const result = await response.json();
        setTeamData(result);
        console.log(result);
        if (result.projectResults && result.projectResults.length > 0) {
          fetchAssociatedArticles(result.projectResults);
        }
        
        const lastApply = await getItemFromAsyncStorage(`lastApply_${teamId}`);
        setLastApplicationTime(lastApply ? parseInt(lastApply) : null);
      } catch (err) {
        setError(err.message);
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
      const articleResults = projectResults.filter(pr => pr.type === 'article' && pr.post_id && pr.is_completed);
      const articles = await Promise.all(
        articleResults.map(async (result) => {
          const response = await fetch(`${BASE_INFO.BASE_URL}api/posts/${result.post_id}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        })
      );
      setAssociatedArticles(articles.filter(article => article !== null));
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleApplyToJoin = async () => {
    const now = Date.now();
    if (lastApplicationTime && (now - lastApplicationTime) < 5 * 60 * 1000) {
      const remainingMinutes = Math.ceil((5 * 60 * 1000 - (now - lastApplicationTime)) / (60 * 1000));
      ToastAndroid.show(`请等待 ${remainingMinutes} 分钟后再提交申请`, ToastAndroid.SHORT);
      return;
    }

    if (!applicationData.email) {
      ToastAndroid.show('请输入邮箱', ToastAndroid.SHORT);
      return;
    }
    if (!applicationData.description) {
      ToastAndroid.show('请输入申请描述', ToastAndroid.SHORT);
      return;
    }

    setIsApplying(true);
    try {
      const accessToken = await getItemFromAsyncStorage("accessToken");
      const response = await fetch(`${BASE_INFO.BASE_URL}api/invite/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          team_id: teamId,
          email: applicationData.email,
          description: applicationData.description
        })
      });

      const result = await response.json();

      if (response.ok) {
        ToastAndroid.show('申请已发送', ToastAndroid.SHORT);
        setShowApplyModal(false);
        setApplicationData({ email: '', description: '' });

        const now = Date.now();
        setLastApplicationTime(now);
        await setItemInAsyncStorage(`lastApply_${teamId}`, now.toString());
      } else {
        throw new Error(result.message || '申请失败');
      }
    } catch (err) {
      ToastAndroid.show(err.message, ToastAndroid.SHORT);
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
        <Text className="text-red-500 dark:text-red-400">加载失败: {error}</Text>
      </View>
    );
  }

  const gradeLabel = GRADES.find(grade => grade.value === teamData.grade)?.label || '未知';

  return (
    <ScrollView className="flex-1 p-4 bg-gray-100 dark:bg-gray-900">
      {/* 团队名称 */}
      <View className='mb-4 bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-xl justify-between'>
        <View className="flex-row justify-between items-center mb-4">
          <View className='ml-1'>
            <Text className="text-2xl dark:text-white mb-2" style={{fontFamily:"NotoSerifSC"}}>{teamData.team_name}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              创建于 {new Date(teamData.create_at).toLocaleDateString()}
            </Text>
          </View>
          {/* 等级与公开状态 */}
          <View className="">
            <View className="bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded-t-lg">
              <Text className="text-blue-700 dark:text-gray-200 text-sm">推荐加入等级: {gradeLabel}</Text>
            </View>
            <View className="bg-green-100 dark:bg-cyan-600 px-3 py-2 rounded-b-lg">
              <Text className="text-green-700 dark:text-gray-300 text-sm">
                {teamData.is_public ? '公开团队' : '私密团队'}
              </Text>
            </View>
          </View>
        </View>
        {/* 申请加入按钮 */}
        <TouchableOpacity
          className={`${
            teamData.chatRoom.members?.some(member => member.user_id === userId)
              ? 'bg-gray-300 dark:bg-gray-600'
              : 'bg-blue-500 dark:bg-blue-700'
          } py-3 rounded-lg`}
          onPress={() => {
            if (!teamData.chatRoom?.members?.some(member => member.user_id === userId)) {
              setShowApplyModal(true);
            }
          }}
          disabled={teamData.chatRoom?.members?.some(member => member.user_id === userId)}
        >
          <Text className={`text-center font-bold ${
            teamData.chatRoom?.members?.some(member => member.user_id === userId)
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-white'
          }`}>
            {teamData.chatRoom?.members?.some(member => member.user_id === userId)
              ? '你已经是队伍成员'
              : '申请加入队伍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 标签 */}
      {teamData.tags?.length > 0 && 
        <View className="mb-4">
          <Text className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-lg">标签</Text>
          <View className="flex-row flex-wrap">
            {teamData.tags.map((tag) => (
              <TouchableOpacity 
                key={tag.tag_id}
                onPress={()=>{
                  navigation.navigate("Tag",{
                    tagId: tag.tag_id
                  });
                }}
                className="bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-full mr-2 mb-2"
              >
                <Text className="text-indigo-700 dark:text-gray-200 text-sm">{tag.tag_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      }
      {/* 队伍成员 */}
      { teamData.chatRoom &&
        <View className='mb-4 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'>
          <Text className='font-semibold text-dark dark:text-gray-300 mt-1 text-lg'>队伍成员：</Text>
          <View className='flex-row px-1 py-2'>
            {teamData.chatRoom.members.map((member, index) => (
              <TouchableOpacity
                key={index}
                className='mr-4 py-1 px-3 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-900' 
                onPress={()=>{
                  navigation.navigate("profile", {
                    team_id : teamData.team_id,
                    user_id : member.user_id,
                    user_name: member.name
                  });
                }}
              >
                <MaterialIcons 
                  name={member.role === 'member' ? 'person' : 'star'} 
                  color={isDark ? "#fff" : "#000"} 
                  size={20}
                />
                <Text className='text-gray-700 dark:text-gray-300 leading-relaxed font-semibold text-sm mt-1'>{member.name}</Text>
                <Text className='text-gray-700 dark:text-gray-300 leading-relaxed text-sm'>
                  {PartyGrade.find(role => role.value === member.role)?.grade || member.role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      }
      {/* 描述 */}
      <View className="mb-4 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <Text className='font-semibold text-dark dark:text-gray-300 mt-1 text-lg'>队伍描述：</Text>
        <Text className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {teamData.description}
        </Text>
      </View>

      {/* 关联文章 */}
      {articlesLoading ? (
        <ActivityIndicator size="small" color="#3b82f6" className="my-4" />
      ) : associatedArticles.length > 0 && (
        <View className="mb-6">
          <Text className="font-semibold text-gray-700 dark:text-gray-300 mb-2">已发布的文章</Text>
          {associatedArticles.map((article) => (
            <TouchableOpacity 
              key={article.post_id} 
              onPress={()=>{
                navigation.navigate("Post",{
                  screen: "PostDetail",
                  params :{
                    postId: article.post_id
                  }
                });
              }}
              className="mb-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <Text className="text-lg font-bold text-gray-800 dark:text-white mb-1">{article.title}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                作者: {article.author?.name || '未知'}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300" numberOfLines={2}>
                {article.content?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 申请加入模态框 */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 p-4">
          <View className="w-full bg-white dark:bg-gray-800 rounded-lg p-6">
            <Text className="text-xl font-bold dark:text-white mb-4">申请加入团队</Text>
            
            <Text className="text-gray-700 dark:text-gray-300 mb-1">邮箱</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded p-2 mb-4 dark:text-white dark:bg-gray-700"
              placeholder="请输入您的邮箱"
              placeholderTextColor="#9CA3AF"
              value={applicationData.email}
              onChangeText={(text) => setApplicationData({...applicationData, email: text})}
              keyboardType="email-address"
            />
            
            <Text className="text-gray-700 dark:text-gray-300 mb-1">申请描述</Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded p-2 mb-6 h-24 dark:text-white dark:bg-gray-700"
              placeholder="请说明您想加入的原因"
              placeholderTextColor="#9CA3AF"
              value={applicationData.description}
              onChangeText={(text) => setApplicationData({...applicationData, description: text})}
              multiline
            />
            
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded mr-2"
                onPress={() => setShowApplyModal(false)}
              >
                <Text className="dark:text-white">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-blue-500 dark:bg-blue-700 rounded"
                onPress={handleApplyToJoin}
                disabled={isApplying}
              >
                {isApplying ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white">提交申请</Text>
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