import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, useColorScheme } from 'react-native';
import TeamFeed from "../../components/feedElem/TeamFeed";
import { useNavigation } from "@react-navigation/native";
import { getItemFromAsyncStorage } from "../../utils/LocalStorage";
import { BASE_INFO } from "../../constant/base";
import { navigate } from "../../navigation/NavigatorRef";
import { colors } from 'react-native-keyboard-controller/lib/typescript/components/KeyboardToolbar/colors';
const screenWidth = Dimensions.get('window').width;

export default function IeaMarketScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";
  return (
    <SafeAreaView style={{ flex: 1 }} className='bg-white dark:bg-gray-600'>
      <View className='mt-10 px-4 mb-3 '
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
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-800'
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
              width: screenWidth / 2 - 15,
            }}>
              <Text className='text-dark dark:text-gray-300'>创建项目</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <TouchableOpacity
          className='border border-gray-300 rounded-xl dark:border-gray-400 bg-white dark:bg-gray-800'
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
              width: screenWidth / 2 - 25,
            }}>
              <Text className='text-dark dark:text-gray-300'>项目进度</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
          className='border border-gray-300 dark:border-gray-400 rounded-xl bg-white dark:bg-gray-800'
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
              width: screenWidth / 2 - 15,
            }}>
              <Text className='text-dark dark:text-gray-300'>聊天服务</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>


      <TeamFeed />
    </SafeAreaView>
  );
}