import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRoute } from "@react-navigation/native"
import Icon from 'react-native-vector-icons/MaterialIcons'
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage"
import axios from 'axios'
import { BASE_INFO } from '../../../constant/base';

const ChatGroupSetting = () => {
  const route = useRoute()
  const { team_id } = route.params
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getItemFromAsyncStorage("accessToken")
        const user = await getItemFromAsyncStorage("user")
        
        setAccessToken(token)
        setCurrentUser(user)
        
        const response = await axios.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        setTeamData(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        Alert.alert('Error', 'Failed to load team data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [team_id])

  const handleEditField = (field, currentValue) => {
    setEditField(field)
    setEditValue(currentValue)
    setEditModalVisible(true)
  }

  const saveChanges = async () => {
    try {
      if (editField === 'team_name' || editField === 'description') {
        await axios.put(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, {
          [editField]: editValue
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      } else if (editField === 'chatroom_name') {
        await axios.put(`${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/update`, {
          name: editValue
        }, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      }
      
      // Refresh data
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      setTeamData(response.data)
      setEditModalVisible(false)
    } catch (error) {
      console.error('Error updating:', error)
      Alert.alert('Error', 'Failed to update')
    }
  }

  const updateMemberRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/members/${userId}/role`,
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      // Refresh data
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      setTeamData(response.data)
      setRoleModalVisible(false)
    } catch (error) {
      console.error('Error updating role:', error)
      Alert.alert('Error', 'Failed to update role')
    }
  }

  const transferOwnership = async (newOwnerId) => {
    try {
      await axios.post(
        `${BASE_INFO.BASE_URL}api/chatrooms/${teamData.chatRoom.room_id}/transfer-owner`,
        { newOwnerId },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      // Refresh data
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/teams/${team_id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      setTeamData(response.data)
      setRoleModalVisible(false)
    } catch (error) {
      console.error('Error transferring ownership:', error)
      Alert.alert('Error', 'Failed to transfer ownership')
    }
  }

  const currentUserRole = teamData?.chatRoom?.members.find(m => m.user_id === currentUser?.userId)?.role

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-800 dark:text-gray-200">Loading...</Text>
      </View>
    )
  }

  if (!teamData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-800 dark:text-gray-200">Failed to load team data</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 p-4">
      {/* Team Info Section */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm shadow-black/5 dark:shadow-white/5">
        <Text className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Group Information</Text>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">Team Name:</Text>
          <View className="flex-row items-center flex-[2] justify-between">
            <Text className="text-base text-gray-900 dark:text-gray-100">{teamData.team_name}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('team_name', teamData.team_name)}>
                <Icon name="edit" size={20} className="text-gray-500 dark:text-gray-400" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">Description:</Text>
          <View className="flex-row items-center flex-[2] justify-between">
            <Text className="text-base text-gray-900 dark:text-gray-100">{teamData.description}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('description', teamData.description)}>
                <Icon name="edit" size={20} className="text-gray-500 dark:text-gray-400" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">Chatroom Name:</Text>
          <View className="flex-row items-center flex-[2] justify-between">
            <Text className="text-base text-gray-900 dark:text-gray-100">{teamData.chatRoom.name || 'Unnamed Chat'}</Text>
            {['owner', 'co_owner'].includes(currentUserRole) && (
              <TouchableOpacity onPress={() => handleEditField('chatroom_name', teamData.chatRoom.name)}>
                <Icon name="edit" size={20} className="text-gray-500 dark:text-gray-400" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">Created At:</Text>
          <Text className="text-base text-gray-900 dark:text-gray-100 flex-[2]">
            {new Date(teamData.create_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center">
          <Text className="text-base text-gray-600 dark:text-gray-300 flex-1">Visibility:</Text>
          <Text className="text-base text-gray-900 dark:text-gray-100 flex-[2]">
            {teamData.is_public ? 'Public' : 'Private'}
          </Text>
        </View>
      </View>

      {/* Members Section */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm shadow-black/5 dark:shadow-white/5">
        <Text className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
          Members ({teamData.chatRoom.members.length})
        </Text>
        
        {teamData.chatRoom.members.map(member => (
          <View key={member.user_id} className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center">
              <Text className="text-base mr-2 text-gray-900 dark:text-gray-100">{member.name}</Text>
              <Text className={`text-sm px-2 py-0.5 rounded ${
                member.role === 'owner' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                member.role === 'co_owner' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                {member.role}
              </Text>
            </View>
            
            {currentUserRole === 'owner' && member.role !== 'owner' && (
              <TouchableOpacity onPress={() => {
                setSelectedMember(member)
                setRoleModalVisible(true)
              }}>
                <Icon name="more-vert" size={24} className="text-gray-500 dark:text-gray-400" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-5 w-4/5">
            <Text className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Edit {editField.replace('_', ' ')}
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded p-3 mb-4 text-gray-900 dark:text-gray-100 dark:bg-gray-700"
              value={editValue}
              onChangeText={setEditValue}
              multiline={editField === 'description'}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity 
                className="bg-gray-500 p-3 rounded-lg flex-1 mr-2"
                onPress={() => setEditModalVisible(false)}
              >
                <Text className="text-white font-bold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 p-3 rounded-lg flex-1 ml-2"
                onPress={saveChanges}
              >
                <Text className="text-white font-bold text-center">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={roleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-5 w-4/5">
            <Text className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
              Change Role for {selectedMember?.name}
            </Text>
            
            <TouchableOpacity 
              className="p-4 border-b border-gray-200 dark:border-gray-700"
              onPress={() => updateMemberRole(selectedMember.user_id, 'co_owner')}
            >
              <Text className="text-base text-gray-900 dark:text-gray-100">Set as Co-Owner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="p-4 border-b border-gray-200 dark:border-gray-700"
              onPress={() => updateMemberRole(selectedMember.user_id, 'member')}
            >
              <Text className="text-base text-gray-900 dark:text-gray-100">Set as Member</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="p-4 mt-2 border-t border-gray-200 dark:border-gray-700"
              onPress={() => transferOwnership(selectedMember.user_id)}
            >
              <Text className="text-base font-bold text-red-500">Transfer Ownership</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-gray-500 p-3 rounded-lg mt-5"
              onPress={() => setRoleModalVisible(false)}
            >
              <Text className="text-white font-bold text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

export default ChatGroupSetting