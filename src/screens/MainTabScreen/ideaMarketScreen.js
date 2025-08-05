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
    <SafeAreaView style={{ flex: 1 }} className='bg-white dark:bg-gray-600'>
      <View className='mt-10 px-5 mb-3 '
      style={{
        flexDirection: 'column',
        gap: 10,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}>
          <Text
            className='text-4xl text-black dark:text-gray-200'
            style={{
              fontFamily: "NotoSerifSC",
              flex: 1,
            }}
          >
            想法市场
          </Text>

          <TouchableOpacity
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-600'
            onPress={() => {
              navigate('RootIdea', { screen: 'CreateFlow', params: { screen: 'Create' } });
            }}
          >
            <View style={{
              // backgroundColor: '#eee2bc',
              padding: 15,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              width: screenWidth / 2 - 35,
            }}>
              <Text className='text-dark dark:text-gray-300'>创建团队</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <TouchableOpacity
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-600'
            onPress={() => {
              navigate('RootIdea', { screen: 'Progress', params: { screen: 'TimeLine', params: { screen: "TimeLine" } } });
            }}
          >
            <View style={{
              // backgroundColor: '#fae287',
              padding: 15,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              width: screenWidth / 2 - 15,
            }}>
              <Text className='text-dark dark:text-gray-300'>项目进度</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
          className='border border-gray-300 dark:border-gray-400 rounded-xl bg-white dark:bg-gray-600'
            onPress={() => {
              navigate('RootIdea', { screen: 'Chat', params: { screen: 'section' } });
            }}
          >
            <View style={{
              // backgroundColor: '#c5eccd',
              padding: 15,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              width: screenWidth / 2 - 35,
            }}>
              <Text className='text-dark dark:text-gray-300'>聊天服务</Text>
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
            onItemPress={(userId) => navigate('RootIdea', { screen: 'profile', params: { user_id:user.id, user_name: user.name } })}
          />
      </View>
      

      <TeamFeed />
    </SafeAreaView>
  );
}