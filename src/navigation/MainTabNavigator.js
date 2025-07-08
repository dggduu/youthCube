import React, { useContext, useState,useEffect } from 'react';
import { View, useColorScheme, Keyboard } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ChatScreen from '@screens/MainTabScreen/chatScreen';
import IdeaMarketScreen from '@screens/MainTabScreen/ideaMarketScreen';
import LearningHomeScreen from '@screens/MainTabScreen/learningHomeScreen';
import ProfileScreen from '@screens/MainTabScreen/profileScreen';
import ProfileNavigtor from "../navigation/profileNavigator/ProfileNavigtor";
import PostNavgator from "./learningNavigtor/PostNavigtor";
import FunctionNavigator from "./learningNavigtor/FunctionNavigator";
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const [isDark, setIsDark] = useState(false);
  const colorScheme = useColorScheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false); // 修复 gifted-chat 内部的 KeyBoardAvoid 造成的显示bug

  useEffect(() => {
    if (colorScheme === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [colorScheme]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
          height: isKeyboardVisible ? 0 : 60,
        },
      })}
    >
      <Tab.Screen name="聪宝" component={ChatScreen} />
      <Tab.Screen name="想法市场" component={IdeaMarketScreen} />
      <Tab.Screen name="学习中心" component={FunctionNavigator} />
      <Tab.Screen name="我的" component={ProfileNavigtor} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;