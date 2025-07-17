import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from "react";
import MosciaChart from "../../../components/chart/MosciaChart";
import TimeLine from "../../../components/chart/TimeLine";
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../../constant/base';
import axios from 'axios';

const ProgressScreen = () => {
  const [teamId, setTeamId] = useState(null);
  const [role, setRole] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isOwnerOrCoOwner, setIsOwnerOrCoOwner] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. 获取用户数据
        const userData = await getItemFromAsyncStorage("user");
        if (!userData) {
          throw new Error("用户数据不存在");
        }
        
        setUserId(userData.id);
        setTeamId(userData.team_id || null);

        // 2. 如果有团队，获取团队详情
        if (userData.team_id) {
          const response = await axios.get(
            `${BASE_INFO.BASE_URL}api/teams/${userData.team_id}`,
            {
              headers: {
                Authorization: `Bearer ${await getItemFromAsyncStorage("accessToken")}`
              }
            }
          );
          
          const teamData = response.data;
          setRole(teamData.chatRoom?.members || []);

          // 3. 检查用户角色
          const currentUserInTeam = teamData.chatRoom?.members?.find(
            (member) => member.user_id === userData.id
          );

          setIsOwnerOrCoOwner(['owner', 'co_owner'].includes(currentUserInTeam?.role || ''));
        }
      } catch (error) {
        console.error("数据获取失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-100 dark:bg-gray-900'>
      <View className='flex-row mt-3'>
        <TouchableOpacity
          className='bg-white p-3 rounded-full w-20 ml-3 items-center justify-center'
        >
          <Text>队伍</Text>
        </TouchableOpacity>

        {isOwnerOrCoOwner && (
          <TouchableOpacity
            className='p-3 bg-white rounded-full ml-3'
            onPress={() => {
              navigation.navigate('Admin', {
                teamId: teamId,
                role: role
              });
            }}
          >
            <MaterialIcons name='settings' size={15} color="#33f"/>
          </TouchableOpacity>
        )}
      </View>
      
      <View className='mt-2'>
        <MosciaChart team_id={teamId} />
      </View>
      
      <View className='mt-6 flex-1 mr-1 ml-4'>
        <TimeLine teamId={teamId} role={role}/>
      </View>
      
      {teamId && (
        <TouchableOpacity
          className='absolute bottom-6 right-6 bg-blue-500 p-4 rounded-full shadow-lg'
          onPress={() => {
            navigation.navigate("Add", {
              teamId: teamId
            });
          }}
        >
          <MaterialIcons name='add' size={20} color="#fff"/>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProgressScreen;