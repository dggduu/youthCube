import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, useColorScheme } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute, useNavigation } from "@react-navigation/native"
import Icon from 'react-native-vector-icons/MaterialIcons'
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage"
import axios from 'axios'
import { BASE_INFO } from '../../../constant/base';
import { GRADES } from "../../../constant/user";
import { useToast } from "../../../components/tip/ToastHooks";

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const ChatGroupSetting = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const route = useRoute();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const { team_id } = route.params
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [gradeLabel, setGradeLabel] = useState('未知');
  const [currentUser, setCurrentUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [transferOwnerModalVisible, setTransferOwnerModalVisible] = useState(false);
  
  const refreshTeamData = async () => {
    try {
      const response = await api.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`)

    if (response.data?.grade !== undefined && response.data?.grade !== null) {
      const foundGrade = GRADES.find(grade => grade.value === response.data.grade);
      setGradeLabel(foundGrade?.label || '未知');
    } else {
      setGradeLabel('未知');
    }

      setTeamData(response.data)
    } catch (error) {
      showToast('刷新团队数据出错', 'error');
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getItemFromAsyncStorage("accessToken")
        const userString = await getItemFromAsyncStorage("user")
        console.log("当前用户:",userString);
        setAccessToken(token)
        if (userString) {
          setCurrentUser(userString) 
        }
        
        const response = await api.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`)

        if (response.data?.grade !== undefined && response.data?.grade !== null) {
          const foundGrade = GRADES.find(grade => grade.value === response.data.grade);
          setGradeLabel(foundGrade?.label || '未知');
        } else {
          setGradeLabel('未知');
        }

        console.log("团队数据",response.data);
        setTeamData(response.data)
      } catch (error) {
        showToast("错误！加载团队数据失败",'error');
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [team_id])

  const handleEditField = (field, currentValue) => {
    setEditField(field)
    if (field === 'is_public') {
      setEditValue(currentValue === 1 ? '公开' : '私有')
    } else {
      setEditValue(currentValue)
    }
    setEditModalVisible(true)
  }

  const saveChanges = async () => {
    try {
      if (editField === 'team_name' || editField === 'description' || editField === 'is_public' || editField === 'grade') {
        await api.put(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, {
          [editField]: editField === 'is_public' ? (editValue === '公开' ? 1 : 0) : editValue
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      } else if (editField === 'chatroom_name') {
        await api.put(`${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/update`, {
          name: editValue
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      }
      showToast("更新成功","success");
      await refreshTeamData();
      setEditModalVisible(false)
    } catch (error) {
      console.error('更新出错:', error)
      showToast("更新失败","error");
    }
  }

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
      )
      
      await refreshTeamData();
      setRoleModalVisible(false)
    } catch (error) {
      console.error('更新角色出错:', error)
      showToast("更新失败","error");
    }
  }

  const transferOwnership = async (newOwnerId) => {
    const newOwnerName = teamData.chatRoom.members.find(m => m.user_id === newOwnerId)?.name;
    Alert.alert(
      "转移队长权限",
      `确定要将队长权限转移给 ${newOwnerName} 吗？您将成为共同所有者。`,
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确认",
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
              )
              
              await refreshTeamData();
              setRoleModalVisible(false);
              setTransferOwnerModalVisible(false);
              showToast("成功转移队长权限","success");
            } catch (error) {
              console.error('转移所有权出错:', error)
              showToast("转移权限失败","error");
            }
          }
        }
      ]
    )
  }

  const handleRemoveMember = async (userId, userName) => {
    Alert.alert(
      "移除成员",
      `确定要将 ${userName} 从队伍中移除吗？`,
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确认",
          onPress: async () => {
            try {
              await api.delete(
                `${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/members/${userId}`,
                {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`
                  }
                }
              )
              await refreshTeamData();
              setRoleModalVisible(false);
              showToast(`${userName} 已被移除`,"success");
            } catch (error) {
              console.error('移除成员出错:', error);
              showToast("移除成员失败","error");
            }
          }
        }
      ]
    );
  };

  const handleLeaveGroup = async (userId) => {
    const userIsOwner = currentUserRole === 'owner';
    const numMembers = teamData.chatRoom.members.length;

    Alert.alert(
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
  const handleDelTeam = async () => {
    const userIsOwner = currentUserRole === 'owner';
    const numMembers = teamData.chatRoom.members.length;

    Alert.alert(
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

  const currentUserRole = teamData?.chatRoom?.members.find(m => m.user_id === currentUser?.id)?.role
  const potentialNewOwners = teamData?.chatRoom?.members.filter(m => m.user_id !== currentUser?.userId) || [];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-800 dark:text-gray-200">加载中...</Text>
      </View>
    )
  }

  if (!teamData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-800 dark:text-gray-200">加载团队数据失败</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
      {/* 群组信息部分 */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm shadow-black/5 dark:shadow-white/5">
        <Text className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">群组信息</Text>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">团队名称:</Text>
          <View className="flex-row items-center flex-[2] justify-between">
            <Text className="text-base text-gray-900 dark:text-gray-100">{teamData.team_name}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('team_name', teamData.team_name)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#eee' : '#555'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">描述:</Text>
          <View className="flex-row items-center flex-[2] justify-between">
            <Text className="text-base text-gray-900 dark:text-gray-100">{teamData.description}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('description', teamData.description)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#eee' : '#555'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">聊天室名称:</Text>
          <View className="flex-row items-center flex-[2] justify-between">
            <Text className="text-base text-gray-900 dark:text-gray-100">{teamData.chatRoom.name || '未命名聊天'}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('chatroom_name', teamData.chatRoom.name)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#eee' : '#555'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">推荐参加年龄</Text>
          <View className="flex-row items-center flex-[2] justify-between">
            <Text className="text-base text-gray-900 dark:text-gray-100">{gradeLabel}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('grade', teamData.grade)}>
                <Icon name="edit" size={20} color={isDarkMode ? '#eee' : '#555'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">创建时间:</Text>
          <Text className="text-base text-gray-900 dark:text-gray-100 flex-[2]">
            {new Date(teamData.create_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">可见性:</Text>
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => handleEditField('is_public', teamData.is_public)}
            >
              <Text className="ml-1 text-blue-500 dark:text-gray-100">{teamData.is_public == 1 ? "公开" : "私有"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 成员部分 */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm shadow-black/5 dark:shadow-white/5">

        <View className='flex-row mb-3 justify-between'>
          <Text className="text-lg font-bold  text-gray-900 dark:text-gray-100">
            成员 ({teamData.chatRoom.members.length})
          </Text>
          <TouchableOpacity
            className='items-center justify-center'
            onPress={()=>{
              navigation.navigate("Invite", {
                chatRoom_id : teamData.chatRoom.room_id,
                team_id: teamData.team_id
              })
            }}  
          >
            <Icon name="add" size={25} color={isDarkMode ? '#eee' : '#555'}/>
          </TouchableOpacity>
        </View>
        {teamData.chatRoom.members.map(member => (
          <View key={member.user_id} className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <View className="flex-row items-center">
              <Text className="text-base mr-2 text-gray-900 dark:text-gray-100">{member.name} {member.user_id === currentUser?.userId ? '(您)' : ''}</Text>
              <Text className={`text-sm px-2 py-0.5 rounded ${
                member.role === 'owner' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                member.role === 'co_owner' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                {member.role === 'owner' ? '组长' : member.role === 'co_owner' ? '管理' : '成员'}
              </Text>
            </View>
            
            {(['owner', 'co_owner'].includes(currentUserRole) && member.user_id !== currentUser?.userId) && 
             !(currentUserRole === 'co_owner' && ['owner', 'co_owner'].includes(member.role)) && (
              <TouchableOpacity onPress={() => {
                setSelectedMember(member)
                setRoleModalVisible(true)
              }}>
                <Icon name="more-vert" size={24} color={isDarkMode ? '#eee' : '#555'} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* 管理员操作部分 */}
      {['owner', 'co_owner'].includes(currentUserRole) && (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm shadow-black/5 dark:shadow-white/5">
          <Text className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">管理员操作</Text>

          {currentUserRole === 'owner' && (
            <TouchableOpacity 
              className="bg-blue-500 p-3 rounded-lg"
              onPress={() => setTransferOwnerModalVisible(true)}
            >
              <Text className="text-white font-bold text-center">转移组长权限</Text>
            </TouchableOpacity>
          )}
        <TouchableOpacity 
          className="bg-gray-100 border border-gray-300 p-3 rounded-lg mt-2"
          onPress={()=>{
            navigation.navigate("InviteRedux",{
              team_id : teamData.team_id,
              room_id: teamData.chatRoom.room_id,
              inviter : currentUser.id
            })
          }}
        >
          <Text className="text-black text-center">查看入群申请</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-red-500 border-gray-300 p-3 rounded-lg mt-2"
          onPress={()=>{
            handleDelTeam()
          }}
        >
          <Text className="text-white font-medium text-center">删除队伍</Text>
        </TouchableOpacity>
        </View>
      )}

      {/* 常规操作部分 */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm shadow-black/5 dark:shadow-white/5">
        <Text className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">常规操作</Text>
        <TouchableOpacity 
          className="bg-red-500 p-3 rounded-lg"
          onPress={()=>{
            handleLeaveGroup(currentUser.id)
          }}
        >
          <Text className="text-white font-bold text-center">退出群组</Text>
        </TouchableOpacity>
      </View>

      {/* 编辑模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-5 w-4/5">
            <Text className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              编辑 {editField.replace('_', ' ')}
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded p-3 mb-4 text-gray-900 dark:text-gray-100 dark:bg-gray-700"
              value={editValue}
              onChangeText={setEditValue}
              multiline={editField === 'description'}
              placeholder={`输入新的${editField.replace('_', ' ')}`}
              placeholderTextColor={isDarkMode ? '#A0AEC0' : '#718096'}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-gray-500 p-3 rounded-lg flex-1 mr-2"
                onPress={() => setEditModalVisible(false)}
              >
                <Text className="text-white font-bold text-center">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 p-3 rounded-lg flex-1 ml-2"
                onPress={saveChanges}
              >
                <Text className="text-white font-bold text-center">保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 角色变更模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-5 w-4/5">
            <Text className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              对 {selectedMember?.name} 的操作
            </Text>
            
            {selectedMember?.role !== 'co_owner' && selectedMember?.role !== 'owner' && (
              <TouchableOpacity 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                onPress={() => updateMemberRole(selectedMember.user_id, 'co_owner')}
              >
                <Text className="text-base text-gray-900 dark:text-gray-100">设为管理</Text>
              </TouchableOpacity>
            )}
            
            {['member', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity 
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                onPress={() => updateMemberRole(selectedMember.user_id, 'member')}
              >
                <Text className="text-base text-gray-900 dark:text-gray-100">设为成员</Text>
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
                <Text className="text-base text-red-500">移除成员</Text>
              </TouchableOpacity>
            )}

            {currentUserRole === 'owner' && selectedMember?.user_id !== currentUser?.userId && (
                <TouchableOpacity 
                className="p-4"
                onPress={() => transferOwnership(selectedMember.user_id)}
                >
                <Text className="text-base text-red-500">转移组长权限</Text>
                </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              className="bg-gray-500 p-3 rounded-lg mt-5"
              onPress={() => setRoleModalVisible(false)}
            >
              <Text className="text-white font-bold text-center">取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 转移所有权选择模态框 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={transferOwnerModalVisible}
        onRequestClose={() => setTransferOwnerModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-5 w-4/5">
            <Text className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              转移组长给:
            </Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {potentialNewOwners.length > 0 ? (
                potentialNewOwners.map(member => (
                  <TouchableOpacity
                    key={member.user_id}
                    className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    onPress={() => transferOwnership(member.user_id)}
                  >
                    <Text className="text-base text-gray-900 dark:text-gray-100">{member.name} ({member.role === 'owner' ? '所有者' : member.role === 'co_owner' ? '共同所有者' : '成员'})</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-center text-gray-600 dark:text-gray-300">没有其他成员可以转移权限。</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              className="bg-gray-500 p-3 rounded-lg mt-5"
              onPress={() => setTransferOwnerModalVisible(false)}
            >
              <Text className="text-white font-bold text-center">取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-5 w-4/5">
            <Text className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              编辑 {editField === 'is_public' ? '可见性' : editField.replace('_', ' ')}
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
                    color={editValue === '公开' ? (isDarkMode ? '#3B82F6' : '#2563EB') : '#9CA3AF'}
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
                    color={editValue === '私有' ? (isDarkMode ? '#3B82F6' : '#2563EB') : '#9CA3AF'}
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
                          color={editValue === item.value ? (isDarkMode ? '#3B82F6' : '#2563EB') : '#9CA3AF'}
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
                placeholder={`输入新的${editField.replace('_', ' ')}`}
                placeholderTextColor={isDarkMode ? '#A0AEC0' : '#718096'}
              />
            )}
            
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-gray-500 p-3 rounded-lg flex-1 mr-2"
                onPress={() => setEditModalVisible(false)}
              >
                <Text className="text-white font-bold text-center">取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 p-3 rounded-lg flex-1 ml-2"
                onPress={saveChanges}
              >
                <Text className="text-white font-bold text-center">保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default ChatGroupSetting