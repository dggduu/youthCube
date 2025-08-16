import { View, Text, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native';
import React, { useState, useEffect } from "react";
import MosciaChart from "../../../components/chart/MosciaChart";
import TimeLine from "../../../components/chart/TimeLine";
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import { BASE_INFO } from '../../../constant/base';
import axios from 'axios';

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const ProgressScreen = () => {
  const [teamId, setTeamId] = useState(null);
  const [role, setRole] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isOwnerOrCoOwner, setIsOwnerOrCoOwner] = useState(false);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userData = await getItemFromAsyncStorage("user");
        if (!userData) {
          throw new Error("用户数据不存在");
        }
        
        setUserId(userData.id);
        setTeamId(userData.team_id || null);

        if (userData.team_id) {
          const response = await api.get(
            `${BASE_INFO.BASE_URL}api/teams/${userData.team_id}`,
            {
              headers: {
                Authorization: `Bearer ${await getItemFromAsyncStorage("accessToken")}`
              }
            }
          );
          
          const teamData = response.data;
          setRole(teamData.chatRoom?.members || []);

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
    <View className='flex-1 bg-gray-50 dark:bg-gray-900'>
      <View className='flex-row mt-3'>
        {/* 多队伍管理，待讨论 */}
        {/* <TouchableOpacity
          className='bg-white p-3 rounded-full w-20 ml-3 items-center justify-center'
        >
          <Text>队伍</Text>
        </TouchableOpacity> */}

        {isOwnerOrCoOwner && (
          <TouchableOpacity
            className='p-3 bg-white rounded-full ml-3 dark:bg-gray-800'
            onPress={() => {
              navigation.navigate('Admin', {
                teamId: teamId,
                role: role
              });
            }}
          >
            <MaterialIcons name='settings' size={15} color={`${isDark? "#eee" : "#000"}`}/>
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
          className='absolute bottom-10 right-6 bg-[#409eff] dark:bg-blue-700 p-5 rounded-full'
          onPress={() => {
            navigation.navigate("Add", { screen: "AddEnd", params: { teamId: teamId } });
          }}
        >
          <MaterialIcons name='add' size={20} color="#fff"/>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProgressScreen;