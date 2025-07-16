import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from "react";
import MosciaChart from "../../../components/chart/MosciaChart";
import TimeLine from "../../../components/chart/TimeLine";
import { getItemFromAsyncStorage, setItemToAsyncStorage } from "../../../utils/LocalStorage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native'
const ProgressScreen = () => {
  const [teamId, setTeamId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getItemFromAsyncStorage("user");
        if (!data) {
          setTeamId(0);
        } else {
          setTeamId(data.team_id);
        }
      } catch (error) {
        console.error("Error fetching team ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    isLoading ? 
    <View className='flex-1 items-center justify-center'>
      <ActivityIndicator size={20} />
    </View>
    :
    <View className='flex-1'>
      <View className='mt-5'>
        <MosciaChart team_id={teamId} />
      </View>
      <View className='mt-4 flex-1 mr-1 ml-4'>
        <TimeLine teamId={teamId} />
      </View>
      <TouchableOpacity
        className='absolute bottom-6 right-4 bg-white dark:bg-gray-400 rounded-full p-4 border border-gray-400'
        onPress={()=>{
          navigation.navigate("Add",{
            teamId : teamId
          });
        }}
      >
        <MaterialIcons name='add' size={20} color="#000"/>
      </TouchableOpacity>
    </View>
  );
};

export default ProgressScreen;