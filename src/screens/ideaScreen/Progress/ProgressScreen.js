import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from "react";
import MosciaChart from "../../../components/chart/MosciaChart";
import TimeLine from "../../../components/chart/TimeLine";
import { getItemFromAsyncStorage, setItemToAsyncStorage } from "../../../utils/LocalStorage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from '@react-navigation/native';
import { BASE_INFO } from '../../../constant/base'
const ProgressScreen = () => {
  const [teamId, setTeamId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = route.params;
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const updateNavigationHeader = async () => {
        try {
          // 查找当前用户在团队中的角色
          const currentUserInTeam = role.find(
            (member) => member.user_id === userId
          );

          const isOwnerOrCoOwner = ['owner', 'co_owner'].includes(currentUserInTeam?.role || '');

          navigation.setOptions({
            title: '时间线',
            headerShown: true,
            headerBackTitle: '返回',
            headerRight: () => (
              isOwnerOrCoOwner ? (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Admin', {
                      teamId: teamId,
                      role: role
                    });
                  }}
                  style={{ marginRight: 10 }}
                >
                  <MaterialIcons name="density-medium" size={24} color="#333" />
                </TouchableOpacity>
              ) : null
            ),
          });
        } catch (error) {
          console.error("Error updating header:", error);
        }
      };

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getItemFromAsyncStorage("user");
        if (!data) {
          setTeamId(0);
          setUserId(0);
        } else {
          setTeamId(data.team_id);
          setUserId(data.id);
        }
      } catch (error) {
        console.error("Error fetching team ID:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    updateNavigationHeader();
  }, [userId, navigation]);

  return (
    isLoading ? 
    <View className='flex-1 items-center justify-center'>
      <ActivityIndicator size={20} />
    </View>
    :
    <View className='flex-1 bg-gray-100 dark:bg-gray-900'>
      <View className='mt-5'>
        <MosciaChart team_id={teamId} />
      </View>
      <View className='mt-4 flex-1 mr-1 ml-4'>
        <TimeLine teamId={teamId} role={role}/>
      </View>
      <TouchableOpacity
        className='absolute bottom-6 right-6 bg-blue-500 p-4 rounded-full shadow-lg'
        onPress={()=>{
          navigation.navigate("Add",{
            teamId : teamId
          });
        }}
      >
        <MaterialIcons name='add' size={20} color="#fff"/>
      </TouchableOpacity>
    </View>
  );
};

export default ProgressScreen;