import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import React from 'react';
import BackIcon from "../../components/backIcon/backIcon";
const data = [
  {
    Q: "如何注册账号？",
    A: "访问注册页面，填写所需信息并提交表单即可完成注册。",
  },
  {
    Q: "忘记密码怎么办？",
    A: "请点击登录页面的“忘记密码”链接，按照提示重置您的密码。",
  },
  {
    Q: "可以更改用户名吗？",
    A: "目前系统不支持直接更改用户名，请联系客服寻求帮助。",
  },
];

const HelpScreen = () => {
  return (
    <SafeAreaView className='flex-1 pt-5 bg-white dark:bg-gray-800'>
      <BackIcon />
      <ScrollView className='w-full px-7 mt-5'>
        {data.map((data, index) => (
          <View key={index} className='my-5'>
            <Text className='font-bold text-xl mb-2 dark:text-gray-300'>{index+1}  {data.Q}</Text>
            <Text className='dark:text-gray-300'>{data.A}</Text>
          </View>
        ))}
      </ScrollView>  
    </SafeAreaView>
  );
};

export default HelpScreen;