import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import TeamFeed from "../../components/feedElem/TeamFeed";
import { useNavigation } from "@react-navigation/native";
import { getItemFromAsyncStorage } from "../../utils/LocalStorage";
import { BASE_INFO } from "../../constant/base";

const screenWidth = Dimensions.get('window').width;

export default function IeaMarketScreen() {
  const navigation = useNavigation();
  const [userID, setUserID] = useState(null);
  const [role, setRole] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        // 获取用户信息
        const userData = await getItemFromAsyncStorage("user");
        if (!userData) throw new Error("用户数据不存在");

        const { id, team_id } = userData;
        setUserID(id);
        setTeamId(team_id);
        if (!team_id) return;
        const response = await fetch(`${BASE_INFO.BASE_URL}api/teams/${team_id}`);
        if (!response.ok) throw new Error('加载失败');
        const result = await response.json();

        setRole(result.chatRoom?.members || []);

      } catch (error) {
        console.error("初始化失败", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className='bg-gray-100 dark:bg-gray-900'
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Progress", {
              screen: "TimeLine",
              params:{
                role:role,
                userId: userID,
              }
            });
          }}
        >
          <View style={{
            backgroundColor: '#fae287',
            padding: 45,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            width: screenWidth / 2 - 15,
          }}>
            <Text className='text-dark dark:text-gray-600 font-semibold'>项目进度</Text>
          </View>
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <TouchableOpacity>
            <View style={{
              backgroundColor: '#eee2bc',
              padding: 15,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              marginBottom: 10,
            }}>
              <Text className='text-dark dark:text-gray-600 font-semibold'>创建项目</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Chat", {
                screen: "section"
              });
            }}
          >
            <View style={{
              backgroundColor: '#c5eccd',
              padding: 15,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
            }}>
              <Text className='text-dark dark:text-gray-600 font-semibold'>聊天服务</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <TeamFeed />
    </SafeAreaView>
  );
}