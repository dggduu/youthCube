import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import TeamFeed from "../../components/feedElem/TeamFeed";
import { useNavigation } from "@react-navigation/native";
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
      }}>
        <TouchableOpacity>
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
            onPress={()=>{
              navigation.navigate("Chat", {
                screen : "section"
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