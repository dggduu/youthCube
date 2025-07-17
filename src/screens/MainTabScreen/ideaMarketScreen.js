import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import TeamFeed from "../../components/feedElem/TeamFeed";
import { useNavigation } from "@react-navigation/native";
import { getItemFromAsyncStorage } from "../../utils/LocalStorage";
import { BASE_INFO } from "../../constant/base";
import { navigate } from "../../navigation/NavigatorRef";
const screenWidth = Dimensions.get('window').width;

export default function IeaMarketScreen() {
  const navigation = useNavigation();

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
            navigate('RootIdea', { screen: 'Progress', params: { screen: 'TimeLine', params:{
              screen: "TimeLine"
            } } })
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
          <TouchableOpacity
            onPress={() => {
              navigate('RootIdea', { screen: 'CreateFlow', params: { screen: 'Create' } });
            }}
          >
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
              navigate('RootIdea', { screen: 'Chat', params: { screen: 'section' } });
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