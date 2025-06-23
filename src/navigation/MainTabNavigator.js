import React, { useContext, useState,useEffect } from 'react';
import { View,useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import chatScreen from '../screens/MainTabScreen/chatScreen';
import ideaMarketScreen from '../screens/MainTabScreen/ideaMarketScreen';
import learningHomeScreen from '../screens/MainTabScreen/learningHomeScreen';
import ProfileScreen from '../screens/MainTabScreen/profileScreen';


const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const [isDark, setIsDark] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (colorScheme === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [colorScheme]);

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
        tabBarActiveTintColor: isDark ? '#b453d2' : 'purple',
        tabBarInactiveTintColor: isDark ? '#8691a4' : '#626e80',
        tabBarStyle: {
          backgroundColor: isDark ? '#1d2024' : '#fafafa',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="聪宝" component={chatScreen} />
      <Tab.Screen name="想法市场" component={ideaMarketScreen} />
      <Tab.Screen name="学习中心" component={learningHomeScreen} />
      <Tab.Screen name="我的" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;