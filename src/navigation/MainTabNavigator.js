import React, { useContext } from 'react';
import { View,useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import chatScreen from '../screens/MainTabScreen/chatScreen';
import ideaMarketScreen from '../screens/MainTabScreen/ideaMarketScreen';
import learningHomeScreen from '../screens/MainTabScreen/learningHomeScreen';
import profileScreen from '../screens/MainTabScreen/profileScreen';
import { colorScheme } from 'nativewind';


const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '聪宝') {
            iconName = focused ? 'chat' : 'chat-bubble-outline';
          } else if (route.name === '想法市场') {
            iconName = focused ? 'lightbulb' : 'lightbulb-outline';
          } else if (route.name === '学习中心') {
            iconName = focused ? 'school' : 'school';
          } else if (route.name === '我的') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? '#a855f7' : 'purple',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : 'gray',
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
        },
      })}
    >
      <Tab.Screen name="聪宝" component={chatScreen} />
      <Tab.Screen name="想法市场" component={ideaMarketScreen} />
      <Tab.Screen name="学习中心" component={learningHomeScreen} />
      <Tab.Screen name="我的" component={profileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;