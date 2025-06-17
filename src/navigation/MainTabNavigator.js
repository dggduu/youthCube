import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/material-icons';

import chatScreen from '../screens/MainTabScreen/chatScreen';
import ideaMarketScreen from '../screens/MainTabScreen/ideaMarketScreen';
import learningHomeScreen from '../screens/MainTabScreen/learningHomeScreen';
import profileScreen from '../screens/MainTabScreen/profileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'purple',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="聪宝" 
        component={chatScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={focused ? 'chat' : 'chat-bubble-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="想法市场" 
        component={ideaMarketScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={focused ? 'lightbulb' : 'lightbulb-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="学习中心" 
        component={learningHomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={focused ? 'school' : 'school'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="我的" 
        component={profileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;