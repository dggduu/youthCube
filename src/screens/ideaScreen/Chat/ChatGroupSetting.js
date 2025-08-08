import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, useColorScheme } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute, useNavigation } from "@react-navigation/native"
import Icon from 'react-native-vector-icons/MaterialIcons'
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage"
import axios from 'axios'
import { BASE_INFO } from '../../../constant/base';
import { GRADES } from "../../../constant/user";
import { useToast } from "../../../components/tip/ToastHooks";
import CustomAlert from "../../../components/custom/CustomAlert";
import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
import InputBox from '../../../components/inputBox'
import TagSelectionToast from "../../../components/TagSelectionToast";
import SingleImageUploader from "../../../components/SingleImageUploader";
const api = axios.create();
setupAuthInterceptors(api);

const ChatGroupSetting = () => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const route = useRoute();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const { team_id } = route.params;
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [gradeLabel, setGradeLabel] = useState('未知');
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [transferOwnerModalVisible, setTransferOwnerModalVisible] = useState(false);
  const [subTeamModalVisible, setSubTeamModalVisible] = useState(false);
  const [newSubTeamName, setNewSubTeamName] = useState('');
  const [inviteToSubTeamModalVisible, setInviteToSubTeamModalVisible] = useState(false);
  const [selectedUserForSubTeam, setSelectedUserForSubTeam] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });
  const [announcement, setAnnouncement] = useState(null);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [teamTags, setTeamTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [coverModalVisible, setCoverModalVisible] = useState(false);

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}/announcements`, {
        params: {
          page: 0,
          size: 1
        }
      });
      if (response.data.items.length > 0) {
        setAnnouncement(response.data.items[0]);
        console.log(announcement);
      }
    } catch (error) {
      console.error('获取公告失败:', error);
    }
  };
  const refreshTeamData = async () => {
    try {
      const response = await api.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`);

      if (response.data?.grade !== undefined && response.data?.grade !== null) {
        const foundGrade = GRADES.find(grade => grade.value === response.data.grade);
        setGradeLabel(foundGrade?.label || '未知');
      } else {
        setGradeLabel('未知');
      }

      setTeamData(response.data);
      setTeamTags(response.data.tags || []);
      setSelectedTagIds(response.data.tags.map(tag => tag.tag_id) || []);
      await fetchAnnouncement();
    } catch (error) {
      showToast('刷新团队数据出错', 'error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getItemFromAsyncStorage("accessToken");
        const userString = await getItemFromAsyncStorage("user");
        setAccessToken(token);
        if (userString) {
          setCurrentUser(userString);
        }

        const response = await api.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`);

        if (response.data?.grade !== undefined && response.data?.grade !== null) {
          const foundGrade = GRADES.find(grade => grade.value === response.data.grade);
          setGradeLabel(foundGrade?.label || '未知');
        } else {
          setGradeLabel('未知');
        }

        setTeamData(response.data);
        setTeamTags(response.data.tags || []);
        setSelectedTagIds(response.data.tags.map(tag => tag.tag_id) || []);
        await fetchAnnouncement();
      } catch (error) {
        showToast("错误！加载团队数据失败", 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [team_id]);

  const handleEditField = (field, currentValue) => {
    setEditField(field);
    
    const fieldHandlers = {
      'is_public': () => setEditValue(currentValue === 1 ? '公开' : '私有'),
      'grade': () => {
        const foundGrade = GRADES.find(grade => grade.value === currentValue);
        setEditValue(currentValue);
        setGradeLabel(foundGrade?.label || '未知');
      },
      'default': () => setEditValue(currentValue)
    };

    (fieldHandlers[field] || fieldHandlers['default'])();
    
    if (field === 'img_url') {
      setCoverModalVisible(true);
    } else {
      setEditModalVisible(true);
    }
  };

  const handleUpdateTeamCover = async (imgUrl) => {
    try {
      if (!imgUrl) {
        showToast("请选择有效的图片", "warning");
        return;
      }

      setLoading(true);
      
      const response = await api.put(
        `${BASE_INFO.BASE_URL}api/teams/${team_id}`,
        { img_url: imgUrl },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      showToast("封面更新成功", "success");
      await refreshTeamData();
    } catch (error) {
      console.error('更新封面出错:', error);
      showToast("封面更新失败: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setLoading(false);
      setCoverModalVisible(false);
    }
  };

  const saveChanges = async () => {
    try {
      const fieldMap = {
        team_name: { team_name: editValue },
        description: { description: editValue },
        is_public: { is_public: editValue === '公开' ? 1 : 0 },
        grade: { grade: editValue },
        img_url: { img_url: editValue },
        chatroom_name: null
      };

      if (editField === 'chatroom_name') {
        await api.put(
          `${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/update`,
          { name: editValue },
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
      } else if (fieldMap[editField]) {
        await api.put(
          `${BASE_INFO.BASE_URL}api/teams/${team_id}`,
          fieldMap[editField],
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
      }

      showToast("更新成功", "success");
      await refreshTeamData();
      setEditModalVisible(false);
    } catch (error) {
      console.error('更新出错:', error);
      showToast(`更新失败: ${error.response?.data?.message || error.message}`, "error");
    }
  };
  const saveTagChanges = async (tagIds) => {
    try {
      await api.put(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, 
        { tag_ids: tagIds },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      showToast("标签更新成功", "success");
      await refreshTeamData();
      setTagModalVisible(false);
    } catch (error) {
      console.error('更新标签出错:', error);
      showToast("标签更新失败", "error");
    }
  }; 

  const handleTagSelection = (selected) => {
    setSelectedTagIds(selected.tagIds);
    saveTagChanges(selected.tagIds);
  }

  const createSubTeam = async () => {
    try {
      if (!newSubTeamName.trim()) {
        showToast("请输入子团队名称", "warning");
        return;
      }

      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/teams/${team_id}/subteam`,
        { team_name: newSubTeamName },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      showToast("子团队创建成功", "success");
      setNewSubTeamName('');
      setSubTeamModalVisible(false);
      await refreshTeamData();
    } catch (error) {
      console.error('创建子团队出错:', error);
      showToast("创建子团队失败", "error");
    }
  };

  const deleteSubTeam = (subTeamId) => {
    showAlert(
      "删除子团队",
      "确定要永久删除这个子团队吗？此操作不可撤销！",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确认删除",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(
                `${BASE_INFO.BASE_URL}api/teams/${team_id}/subteam/${subTeamId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              );

              showToast("子团队已删除", "success");
              await refreshTeamData();
            } catch (error) {
              console.error('删除子团队出错:', error);
              showToast("删除子团队失败", "error");
            }
          }
        }
      ]
    );
  };

  const updateMemberRole = async (userId, newRole) => {
    try {
      await api.put(
        `${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/members/${userId}/role`,
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      await refreshTeamData();
      showToast("权限更新成功", "success");
      setRoleModalVisible(false);
    } catch (error) {
      console.error('更新角色出错:', error);
      showToast("更新失败", "error");
    }
  };

  const showAlert = (title, message, buttons) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons
    });
  };

  const transferOwnership = (newOwnerId) => {
    const newOwnerName = teamData.chatRoom.members.find(m => m.user_id === newOwnerId)?.name;
    showAlert(
      "转移队长权限",
      `确定要将队长权限转移给 ${newOwnerName} 吗？您将成为共同所有者。`,
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确认",
          style: "default",
          onPress: async () => {
            try {
              await api.post(
                `${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/transfer-owner`,
                { newOwnerId },
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              );

              await refreshTeamData();
              setRoleModalVisible(false);
              setTransferOwnerModalVisible(false);
              showToast("成功转移队长权限", "success");
            } catch (error) {
              console.error('转移所有权出错:', error);
              showToast("转移权限失败", "error");
            }
          }
        }
      ]
    );
  };

  const inviteToSubTeamDirect = async (subTeamId) => {
    try {
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/teams/${subTeamId}/members/${selectedUserForSubTeam.user_id}/invite-direct`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      showToast(`${selectedUserForSubTeam.name} 已邀请到子团队`, "success");
      setInviteToSubTeamModalVisible(false);
      setSelectedUserForSubTeam(null);
    } catch (error) {
      console.error('邀请到子团队出错:', error);
      showToast("邀请到子团队失败", "error");
    }
  };

  const handleRemoveMember = (userId, userName) => {
    showAlert(
      "移除成员",
      `确定要将 ${userName} 从队伍中移除吗？`,
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确认",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(
                `${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/members/${userId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              );
              await refreshTeamData();
              setRoleModalVisible(false);
              showToast(`${userName} 已被移除`, "success");
            } catch (error) {
              console.error('移除成员出错:', error);
              showToast("移除成员失败", "error");
            }
          }
        }
      ]
    );
  };

  const handleLeaveGroup = (userId) => {
    const userIsOwner = currentUserRole === 'owner';
    const numMembers = teamData.chatRoom.members.length;

    showAlert(
      "离开群组",
      userIsOwner && numMembers > 1
        ? "您是队长。在离开前必须将队长权限转移给其他成员。"
        : "确定要离开这个群组吗？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确认",
          style: "destructive",
          onPress: async () => {
            if (userIsOwner && numMembers > 1) {
              showToast("请先转让队长权限", "warning");
              return;
            }

            try {
              await api.delete(
                `${BASE_INFO.BASE_URL}api/team/${teamData.chatRoom.room_id}/members/${userId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              );

              navigation.popToTop();
              showToast("你已成功离开队伍", "success");
            } catch (error) {
              console.error('离开群组出错:', error);
              showToast("离开队伍失败", "error");
            }
          }
        }
      ]
    );
  };

  const handleDelTeam = () => {
    const userIsOwner = currentUserRole === 'owner';

    showAlert(
      "删除队伍",
      userIsOwner
        ? "您确定要永久删除这个队伍吗？此操作不可撤销！"
        : "只有队长可以删除队伍",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确认删除",
          style: "destructive",
          onPress: async () => {
            if (!userIsOwner) {
              showToast("只有队长可以删除队伍", "warning");
              return;
            }

            try {
              await api.delete(
                `${BASE_INFO.BASE_URL}api/teams/${teamData.team_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              );

              navigation.popToTop();
              showToast("队伍已成功删除", "success");
            } catch (error) {
              console.error('删除队伍出错:', error);
              showToast("删除队伍失败", "error");
            }
          }
        }
      ]
    );
  };

  const currentUserRole = teamData?.chatRoom?.members.find(m => m.user_id === currentUser?.id)?.role;
  const potentialNewOwners = teamData?.chatRoom?.members.filter(m => m.user_id !== currentUser?.userId) || [];
  const isParentTeam = teamData?.parent_team_id === null;
  const isSubTeam = !isParentTeam;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-800 dark:text-gray-200">加载中...</Text>
      </View>
    );
  }

  if (!teamData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-800 dark:text-gray-200">加载团队数据失败</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">

      {/* 群公告部分 */}
      {announcement && (
        <TouchableOpacity 
          className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 mb-4 border border-yellow-300 dark:border-yellow-900"
          onPress={() => navigation.navigate('AnnouncementDetail', { 
            teamId: team_id,
            role: currentUserRole
          })}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200">
              置顶公告
            </Text>
            <Icon name="chevron-right" size={20} color={isDarkMode ? '#93c5fd' : '#888'} />
          </View>

            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {announcement.title}
            </Text>
          <Text 
            className="text-gray-800 dark:text-gray-200"
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {announcement.content}
          </Text>
          <Text className="text-xs text-gray-800 dark:text-gray-200 mt-2">
            发布者: {announcement.author.name} • {new Date(announcement.created_at).toLocaleString()}
          </Text>
        </TouchableOpacity>
      )}

      {/* 群组信息部分 */}
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {isSubTeam ? '子群组信息' : '群组信息'}
        </Text>
        
        {/* 团队名称 */}
        <View className="flex-row items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 w-24">团队名称:</Text>
          <View className="flex-1 flex-row items-center min-w-0">
            <Text 
              className="flex-1 text-base text-gray-900 dark:text-gray-100"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {teamData.team_name}
            </Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('team_name', teamData.team_name)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#a0aec0' : '#718096'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 描述 */}
        <View className="flex-row items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 w-24">描述:</Text>
          <View className="flex-1 flex-row items-center min-w-0">
            <Text 
              className="flex-1 text-base text-gray-900 dark:text-gray-100"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {teamData.description || '暂无描述'}
            </Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('description', teamData.description)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#a0aec0' : '#718096'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 聊天室名称 */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300">聊天室名称:</Text>
          <View className="flex-row items-center">
            <Text 
              className="text-base text-gray-900 dark:text-gray-100 mr-2"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {teamData.chatRoom?.name || '未命名聊天'}
            </Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('chatroom_name', teamData.chatRoom?.name)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#a0aec0' : '#718096'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300">推荐参加年龄</Text>
          <View className="flex-row items-center">
            <Text className="text-base text-gray-900 dark:text-gray-100 mr-2">{gradeLabel}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('grade', teamData.grade)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#a0aec0' : '#718096'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300">创建时间:</Text>
          <Text className="text-base text-gray-900 dark:text-gray-100">
            {new Date(teamData.create_at).toLocaleDateString()}
          </Text>
        </View>
        
        {isParentTeam && (
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base text-gray-600 dark:text-gray-300">可见性:</Text>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => handleEditField('is_public', teamData.is_public)}
            >
              <Text className="text-blue-500 dark:text-blue-400">{teamData.is_public == 1 ? "公开" : "私有"}</Text>
            </TouchableOpacity>
          </View>
        )}
       {/* 标签 */}
        <View className="flex-col">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-base text-gray-600 dark:text-gray-300">标签:</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => setTagModalVisible(true)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#a0aec0' : '#718096'} />
              </TouchableOpacity>
            )}
          </View>
          
          <View className="flex-row flex-wrap items-center">
            {teamTags.length > 0 ? (
              <>
                {teamTags.slice(0, 3).map(tag => (
                  <View 
                    key={tag.tag_id} 
                    className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mr-1 mb-1 border border-blue-100 dark:border-blue-800"
                  >
                    <Text className="text-blue-800 dark:text-blue-200 text-xs">
                      {tag.tag_name}
                    </Text>
                  </View>
                ))}
                {teamTags.length > 3 && (
                  <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full mr-2 mb-2">
                    <Text className="text-blue-800 dark:text-blue-200 text-xs">
                      +{teamTags.length - 3}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text className="text-base text-gray-500 dark:text-gray-400">
                暂无标签
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* 成员部分 */}
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
        <View className='flex-row mb-3 justify-between items-center'>
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            成员 ({teamData.chatRoom.members.length})
          </Text>
          {!isSubTeam && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Invite", {
                  chatRoom_id: teamData.chatRoom.room_id,
                  team_id: teamData.team_id
                });
              }}  
            >
              <Icon name="add" size={24} color={isDarkMode ? '#a0aec0' : '#718096'}/>
            </TouchableOpacity>
          )}
        </View>
        
        {teamData.chatRoom.members.map(member => (
          <View 
            key={member.user_id} 
            className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <View className="flex-row items-center">
              <Text className="text-base mr-2 text-gray-900 dark:text-gray-100">
                {member.name} {member.user_id === currentUser?.userId ? '(您)' : ''}
              </Text>
              <Text className={`text-xs px-2 py-1 rounded ${
                member.role === 'owner' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                member.role === 'co_owner' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                {member.role === 'owner' ? '组长' : member.role === 'co_owner' ? '管理' : '成员'}
              </Text>
            </View>
            
            {(['owner', 'co_owner'].includes(currentUserRole) && member.user_id !== currentUser?.userId) && 
             !(currentUserRole === 'co_owner' && ['owner', 'co_owner'].includes(member.role)) && (
              <TouchableOpacity 
                onPress={() => {
                  setSelectedMember(member);
                  setRoleModalVisible(true);
                }}
              >
                <Icon name="more-vert" size={24} color={isDarkMode ? '#a0aec0' : '#718096'} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* 子团队部分 - 仅显示给父团队 */}
      {isParentTeam && teamData.subTeams && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <View className='flex-row mb-3 justify-between items-center'>
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              子团队 ({teamData.subTeams.length})
            </Text>
            {currentUserRole === 'owner' && (
              <TouchableOpacity
                onPress={() => setSubTeamModalVisible(true)}
              >
                <Icon name="add" size={24} color={isDarkMode ? '#a0aec0' : '#718096'}/>
              </TouchableOpacity>
            )}
          </View>
          
          {teamData.subTeams.map(subTeam => (
            <View 
              key={subTeam.team_id} 
              className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <View className="flex-row items-center">
                <Text className="text-base mr-2 text-gray-900 dark:text-gray-100">
                  {subTeam.team_name}
                </Text>
                <Text className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  子团队
                </Text>
              </View>
              
              {currentUserRole === 'owner' && (
                <TouchableOpacity 
                  onPress={() => deleteSubTeam(subTeam.team_id)}
                >
                  <Icon name="delete" size={24} color="#f56565" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* 管理员操作部分 */}
      {['owner', 'co_owner'].includes(currentUserRole) && (
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            管理员操作
          </Text>

          <View className="space-y-0">
            {/* 转移组长权限*/}
            {currentUserRole === 'owner' && (
              <TouchableOpacity
                className="flex-row items-center p-3 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                onPress={() => setTransferOwnerModalVisible(true)}
              >
                <Icon name="swap-horiz" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text className="ml-3 text-gray-700 dark:text-gray-200 font-medium">转移组长权限</Text>
              </TouchableOpacity>
            )}

            {/* 分割线 */}
            {(currentUserRole === 'owner' && isParentTeam) || 
            (currentUserRole === 'owner' && !isParentTeam) ? (
              <View className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            ) : null}

            {/* 添加群公告 */}
            <TouchableOpacity
              className="flex-row items-center p-3 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
              onPress={() =>
                navigation.navigate('AnnouncementDetail', {
                  teamId: teamData.team_id,
                  role: currentUserRole,
                })
              }
            >
              <Icon name="add" size={20} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text className="ml-3 text-gray-700 dark:text-gray-200 font-medium">添加群公告</Text>
            </TouchableOpacity>

            {/* 分割线 */}
            {isParentTeam && (
              <View className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            )}

            {/* 查看入群申请 */}
            {isParentTeam && (
              <TouchableOpacity
                className="flex-row items-center p-3 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                onPress={() =>
                  navigation.navigate('InviteRedux', {
                    team_id: teamData.team_id,
                    room_id: teamData.chatRoom.room_id,
                    inviter: currentUser.id,
                  })
                }
              >
                <Icon name="group-add" size={20} color={isDarkMode ? '#4ade80' : '#16a34a'} />
                <Text className="ml-3 text-gray-700 dark:text-gray-200 font-medium">查看入群申请</Text>
              </TouchableOpacity>
            )}

            {currentUserRole == 'owner' &&
              <View className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            }

            {['owner'].includes(currentUserRole) && (
              <TouchableOpacity
              className="flex-row items-center p-3 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
                onPress={()=>{
                  setCoverModalVisible(true);
                }}
              >
                <Icon name="image" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                <Text className="ml-3 text-gray-700 dark:text-gray-200 font-medium">上传队伍头图</Text>
              </TouchableOpacity>
            )}

            <View className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

            <TouchableOpacity
              className="flex-row items-center p-3 rounded-lg bg-white dark:bg-gray-800 active:bg-red-50 dark:active:bg-red-900/20"
              onPress={handleDelTeam}
            >
              <Icon name="delete" size={20} color="#ef4444" />
              <Text className="ml-3 text-red-600 dark:text-red-400 font-medium">删除队伍</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 常规操作部分 */}
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          常规操作
        </Text>

        <View className="space-y-3">
          {/* 退出群组 */}
          <TouchableOpacity
            className="flex-row items-center p-3 rounded-lg"
            onPress={() => handleLeaveGroup(currentUser.id)}
          >
            <Icon name="exit-to-app" size={20} color="#f56565" />
            <Text className="ml-3 text-red-600 dark:text-red-400">退出群组</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 编辑模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-5 w-4/5">
            <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              编辑 {editField === 'team_name' ? '团队名称' : 
                   editField === 'description' ? '描述' : 
                   editField === 'chatroom_name' ? '聊天室名称' : 
                   editField === 'grade' ? '推荐年龄' : '可见性'}
            </Text>
            
            {editField === 'is_public' ? (
              <View className="mb-4">
                <TouchableOpacity 
                  className="flex-row items-center p-3"
                  onPress={() => setEditValue('公开')}
                >
                  <Icon 
                    name={editValue === '公开' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={editValue === '公开' ? '#3b82f6' : '#a0aec0'}
                  />
                  <Text className="ml-2 text-gray-900 dark:text-gray-100">公开</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-row items-center p-3"
                  onPress={() => setEditValue('私有')}
                >
                  <Icon 
                    name={editValue === '私有' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                    size={24} 
                    color={editValue === '私有' ? '#3b82f6' : '#a0aec0'}
                  />
                  <Text className="ml-2 text-gray-900 dark:text-gray-100">私有</Text>
                </TouchableOpacity>
              </View>
            ) : editField === 'grade' ? (
              <View className="mb-4 max-h-60">
                <ScrollView nestedScrollEnabled={true}>
                  {GRADES.map((item, index) => (
                    <TouchableOpacity 
                      key={index}
                      className="flex-row items-center p-3"
                      onPress={() => setEditValue(item.value)}
                    >
                      <Icon 
                        name={editValue === item.value ? 'radio-button-checked' : 'radio-button-unchecked'} 
                        size={24} 
                        color={editValue === item.value ? '#3b82f6' : '#a0aec0'}
                      />
                      <Text className="ml-2 text-gray-900 dark:text-gray-100">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded p-3 mb-4 text-gray-900 dark:text-gray-100 dark:bg-gray-700"
                value={editValue}
                onChangeText={setEditValue}
                multiline={editField === 'description'}
                style={{height: editField === 'description' ? 100 : 50}}
                placeholder={`输入新的${editField === 'team_name' ? '团队名称' : 
                            editField === 'description' ? '描述' : '聊天室名称'}`}
                placeholderTextColor={isDarkMode ? '#a0aec0' : '#718096'}
              />
            )}
            
            <View className="flex-row justify-end">
              <TouchableOpacity 
                className="px-4 py-2 rounded-lg mr-2"
                onPress={() => setEditModalVisible(false)}
              >
                <Text className="text-gray-600 dark:text-gray-300">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-[#409eff] px-4 py-2 rounded-lg"
                onPress={saveChanges}
              >
                <Text className="text-white">保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 角色变更模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-5 w-4/5">
            <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              成员操作: {selectedMember?.name}
            </Text>
            
            {selectedMember?.role !== 'co_owner' && selectedMember?.role !== 'owner' && (
              <TouchableOpacity 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                onPress={() => updateMemberRole(selectedMember.user_id, 'co_owner')}
              >
                <Text className="text-gray-900 dark:text-gray-100">设为管理</Text>
              </TouchableOpacity>
            )}
            
            {selectedMember?.role === 'co_owner' && (
              <TouchableOpacity 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                onPress={() => updateMemberRole(selectedMember.user_id, 'member')}
              >
                <Text className="text-gray-900 dark:text-gray-100">设为成员</Text>
              </TouchableOpacity>
            )}
            
            {/* Add this new option for parent teams */}
            {isParentTeam && teamData.subTeams && teamData.subTeams.length > 0 && (
              <TouchableOpacity 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                onPress={() => {
                  setSelectedUserForSubTeam(selectedMember);
                  setRoleModalVisible(false);
                  setInviteToSubTeamModalVisible(true);
                }}
              >
                <Text className="text-blue-500 dark:text-blue-400">添加到子团队</Text>
              </TouchableOpacity>
            )}
            
            {['owner', 'co_owner'].includes(currentUserRole) && 
            selectedMember?.user_id !== currentUser?.userId && 
            selectedMember?.role !== 'owner' && 
            !(currentUserRole === 'co_owner' && selectedMember?.role === 'co_owner') && (
              <TouchableOpacity 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                onPress={() => handleRemoveMember(selectedMember.user_id, selectedMember.name)}
              >
                <Text className="text-[#f56c6c] dark:text-red-400">移除成员</Text>
              </TouchableOpacity>
            )}

            {currentUserRole === 'owner' && selectedMember?.user_id !== currentUser?.userId && (
              <TouchableOpacity 
                className="p-4"
                onPress={() => transferOwnership(selectedMember.user_id)}
              >
                <Text className="text-blue-500 dark:text-blue-400">转移组长权限</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              onPress={() => setRoleModalVisible(false)}
            >
              <Text className="text-center text-gray-900 dark:text-gray-100">取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 转移所有权选择模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={transferOwnerModalVisible}
        onRequestClose={() => setTransferOwnerModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-5 w-4/5">
            <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              选择新组长
            </Text>
            <ScrollView className="max-h-60">
              {potentialNewOwners.length > 0 ? (
                potentialNewOwners.map(member => (
                  <TouchableOpacity
                    key={member.user_id}
                    className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    onPress={() => transferOwnership(member.user_id)}
                  >
                    <Text className="text-gray-900 dark:text-gray-100">
                      {member.name} ({member.role === 'owner' ? '所有者' : member.role === 'co_owner' ? '共同所有者' : '成员'})
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-center text-gray-600 dark:text-gray-300 py-4">
                  没有其他成员可以转移权限
                </Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              onPress={() => setTransferOwnerModalVisible(false)}
            >
              <Text className="text-center text-gray-900 dark:text-gray-100">取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 创建子团队模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={subTeamModalVisible}
        onRequestClose={() => setSubTeamModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-5 w-4/5">
            <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              创建子团队
            </Text>
            
            <InputBox
              value={newSubTeamName}
              onChangeText={setNewSubTeamName}
              placeholder="输入子团队名称"
            />
            
            <View className="flex-row justify-end">
              <TouchableOpacity 
                className="px-4 py-2 rounded-lg mr-2"
                onPress={() => setSubTeamModalVisible(false)}
              >
                <Text className="text-gray-600 dark:text-gray-300">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-[#409eff] px-4 py-2 rounded-lg"
                onPress={createSubTeam}
              >
                <Text className="text-white">创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {inviteToSubTeamModalVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={inviteToSubTeamModalVisible}
          onRequestClose={() => setInviteToSubTeamModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white dark:bg-gray-800 rounded-lg p-5 w-4/5">
              <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                添加 {selectedUserForSubTeam?.name} 到子团队
              </Text>
              
              <ScrollView className="max-h-60">
                {teamData.subTeams.map(subTeam => (
                  <TouchableOpacity
                    key={subTeam.team_id}
                    className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    onPress={() => inviteToSubTeamDirect(subTeam.team_id)}
                  >
                    <Text className="text-gray-900 dark:text-gray-100">
                      {subTeam.team_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity 
                className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
                onPress={() => setInviteToSubTeamModalVisible(false)}
              >
                <Text className="text-center text-gray-900 dark:text-gray-100">取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <Modal
        animationType="fade"
        transparent={true}
        visible={coverModalVisible}
        onRequestClose={() => setCoverModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-5 w-4/5">
            <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              修改团队封面
            </Text>
            
            <SingleImageUploader 
              AccessToken={accessToken}
              imgUrl={""}
              setImgUrl={handleUpdateTeamCover}
            />
            
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity 
                className="px-4 py-2 rounded-lg mr-2"
                onPress={() => {
                  setAlertConfig({
                    visible: true,
                    title: "清除头图",
                    message: "确定要清除团队封面图片吗？",
                    buttons: [
                      {
                        text: "取消",
                        style: "cancel"
                      },
                      {
                        text: "确认清除",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await api.put(
                              `${BASE_INFO.BASE_URL}api/teams/${team_id}`,
                              { img_url: null },
                              {
                                headers: {
                                  'Authorization': `Bearer ${accessToken}`,
                                  'Content-Type': 'application/json'
                                }
                              }
                            );
                            showToast("封面已清除", "success");
                            await refreshTeamData();
                          } catch (error) {
                            console.error('清除封面出错:', error);
                            showToast("清除封面失败", "error");
                          }
                        }
                      }
                    ]
                  });
                }}
              >
                <Text className="text-red-600 dark:text-red-300">清除头图</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="px-4 py-2 rounded-lg mr-2"
                onPress={() => setCoverModalVisible(false)}
              >
                <Text className="text-gray-600 dark:text-gray-300">取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TagSelectionToast
        visible={tagModalVisible}
        onClose={() => setTagModalVisible(false)}
        onConfirm={handleTagSelection}
        initialSelectedTags={selectedTagIds}
      />

      {/* 自定义弹窗 */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({...alertConfig, visible: false})}
      />
    </ScrollView>
  );
};

export default ChatGroupSetting;