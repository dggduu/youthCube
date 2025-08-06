import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, useColorScheme } from 'react-native';
import TeamFeed from "../../components/feedElem/TeamFeed";
import { useNavigation } from "@react-navigation/native";
import { setItemToAsyncStorage, getItemFromAsyncStorage } from "../../utils/LocalStorage";
import { BASE_INFO } from "../../constant/base";
import { navigate } from "../../navigation/NavigatorRef";
import { colors } from 'react-native-keyboard-controller/lib/typescript/components/KeyboardToolbar/colors';
import { setupAuthInterceptors } from "../../utils/axios/AuthInterceptors";
import InspirationCarousel from "../../components/chart/InspirationCarousel";
import CarouselStart from "../../components/custom/CarouselStart";
import axios from "axios";
import MaterialIcons from '@react-native-vector-icons/material-icons';
const screenWidth = Dimensions.get('window').width;

export default function IeaMarketScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = await getItemFromAsyncStorage("user");
        if (!userString) {
          setLoading(false);
          return;
        }

        const userObj = userString;
        const userId = userObj.id;

        const response = await axios.get(
          `${BASE_INFO.BASE_URL}api/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${await getItemFromAsyncStorage("accessToken")}`
            }
          }
        );

        await setItemToAsyncStorage("user",response.data);

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-600">
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white dark:bg-gray-900'>
      <View className="mt-14 px-5 mb-3 space-y-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text
            style={{
                fontFamily: "NotoSerifSC",
                flex: 1,
              }}
            className="text-4xl text-black dark:text-white mb-1"
          >
            想法市场
          </Text>
        </View>

        <View className="flex-row gap-3">
          {/* 项目进度*/}
          <TouchableOpacity
            className="flex-1 rounded-lg bg-blue-500 dark:bg-blue-800 shadow-lg"
            onPress={() => {
              navigate('RootIdea', { 
                screen: 'Progress', 
                params: { screen: 'TimeLine', params: { screen: "TimeLine" } } 
              });
            }}
          >
            <View className="py-4 items-center justify-center gap-2">
              <MaterialIcons name="timeline" size={24} color="white" />
              <Text className="text-white font-medium">项目进度</Text>
            </View>
          </TouchableOpacity>

          {/* 聊天服务*/}
          <TouchableOpacity
            className="flex-1 rounded-lg bg-emerald-500 dark:bg-emerald-800 shadow-lg"
            onPress={() => {
              navigate('RootIdea', { screen: 'Chat', params: { screen: 'section' } });
            }}
          >
            <View className="py-4 items-center justify-center gap-2">
              <MaterialIcons name="chat" size={24} color="white" />
              <Text className="text-white font-medium">聊天服务</Text>
            </View>
          </TouchableOpacity>

          {/* 创建团队*/}
          <TouchableOpacity
            className="flex-1 rounded-lg bg-purple-500 dark:bg-purple-800 shadow-lg"
            onPress={() => {
              navigate('RootIdea', { screen: 'CreateFlow', params: { screen: 'Create' } });
            }}
          >
            <View className="py-4 items-center justify-center gap-2">
              <MaterialIcons name="groups" size={20} color="white" />
              <Text className="text-white font-medium">创建团队</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View className='flex-1 flex-row px-5'>
        <CarouselStart
          onItemPress={(url) => navigate('RootIdea', { 
            screen: 'webview', 
            params: { url } 
          })}
        />
          <InspirationCarousel 
            onMenuPress={() =>navigate('RootIdea', { screen: 'menu', params: { user_id:user.id, user_name: user.name } })}
          />
      </View>
      
      <TeamFeed />
    </SafeAreaView>
  );
}