import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainSettingScreen from '../../screens/MainTabScreen/ProfileScreen/MainSettingScreen';
import MessageScreen from '../../screens/MainTabScreen/ProfileScreen/MessageScreen';

import PostDetailScreen from "../../screens/learningScreen/PostDetailScreen";
import TagSection from "../../screens/learningScreen/TagSection";
const Stack = createNativeStackNavigator();

export default function TopBarNavigtor() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Setting" component={MainSettingScreen}
              options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="Message" component={MessageScreen}
        options={{
          headerShown: true,
          title: '个人信息',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerShown: true,
          title: '帖子详情',
          headerBackTitle: '返回'
        }}
        />
      <Stack.Screen 
        name="Tag" 
        component={TagSection}
        options={{
          headerShown: true,
          title: '根据 Tag 查询文章',
          headerBackTitle: '返回'
        }}
      />
    </Stack.Navigator>
  );
}