import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React, { useState } from 'react';
import BackIcon from "../../components/backIcon/backIcon";
import Icon from "@react-native-vector-icons/material-icons";
import { Link } from '@react-navigation/native';

const data = [
  {
    title: "账号相关",
    content: [
      {
        Q: "如何注册账号？",
        A: "请访问注册页面，填写所需信息并提交表单即可完成注册。",
      },
      {
        Q: "忘记密码怎么办？",
        A: "未登录时，请点击登录页面的忘记密码链接，按照提示重置密码。\n已登录时，请进入个人中心，点击修改用户信息，按照提示重置密码。",
      },
      {
        Q: "可以更改用户名吗？",
        A: "可以。请进入个人中心，点击修改用户信息，按照提示更改用户名。",
      },
      {
        Q: "邮箱已被注册如何解决",
        A: "请联系客服并提供相关有效证明进行处理。",
      },
      {
        Q: "如何注销账号",
        A: "目前暂不支持账号注销功能。",
      },
    ]
  },
  {
    title: "聊天相关",
    content: [
      {
        Q: "对方接收不到我的消息",
        A: "请先检查网络连接是否正常。如果正常，可能是消息包含敏感词，系统不会在云端存储含有敏感信息的消息。",
      },
      {
        Q: "无法上传附件",
        A: "请检查网络连接是否正常，并确认文件是否符合要求（文件大小150MB以内，文件类型为7z或zip）。",
      },
      {
        Q: "附件多次上传失败",
        A: "可能是当前处于使用高峰期，请稍后再试。"
      },
      {
        Q:"提示429错误",
        A:"可能是授权信息未自动更新，请尝试退出后重新进入软件。如果问题仍然存在，请尝试重新登录。"
      },
      {
        Q:"为什么有时无法更新团队信息",
        A:"可能是有人碰巧也在进行操作，可以等一下再进行操作。"
      }
    ],
  },
  {
    title: "文章问题",
    content: [
      {
        Q: "文章无法正常发送",
        A: "请先检查网络连接是否正常。如果正常，可能是文章包含敏感词，请检查内容是否符合平台规范。",
      },
      {
        Q: "无法发送评论",
        A: "请先检查网络连接是否正常。如果正常，可能是评论包含敏感词，系统不会在云端存储含有敏感信息的评论。",
      },
    ],
  },
  {
    title:"商业合作咨询",
    content:[
      {
        Q: "联系方式",
        A: "aobaradgg@126.com，我们诚挚欢迎各类合作机会。",
      },      
    ]
  },
  {
    title: "其他问题",
    content: [
      {
        Q:"遇到bug如何处理",
        A:"请附上详细截图和问题描述，发送至aobaradgg@126.com，这将帮助我们更好地复现和解决问题。",
      },
      {
        Q:"检查更新失败",
        A:"请检查网络连接，如果正常请访问我们官方的分发渠道获取最新版。",
      },
    ],
  },
];

const HelpScreen = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 发送邮件函数
  const handleSendEmail = () => {
    const email = 'aobaradgg@126.com';
    const subject = '咨询与帮助';
    const body = '您好，我需要帮助：\n（写清楚遇到什么问题：怎么遇到的，现象是什么，什么时间用的，用户名是什么）';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(err => {
      console.error('无法打开邮件客户端:', err);
      alert('无法打开邮件客户端，请确保已安装邮件应用');
    });
  };
  const handleQQqun = () => {
    const deepLink = 'mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=1032147823';
    
    const fallbackLink = 'https://qun.qq.com/universal-share/share?ac=1&authKey=lVo1jTp3lafCMpXao5%2FpQGkemwWyk%2F8gkCbZsYGeDhyXNsHB5jGpXPCkzDu8U0aY&busi_data=eyJncm91cENvZGUiOiIxMDMyMTQ3ODIzIiwidG9rZW4iOiJCNENWaXQ2eVE1WVZGb08xdEVsV1V4MFpjdTd5NTVZRGhiUVhYNTFEcHVIeTBGdEt2VXdYV0RZNTl0K0lNdlpBIiwidWluIjoiMjY1ODg5NTg2NiJ9&data=_VVwJpCSGHkMUykOHnYe7n1d8nlCsL_vZlWdOFOioIzrk0NuQ4Ig5P0lmtl1nZT94BIuWftl06b8gP1JV9Xfew&svctype=4&tempid=h5_group_info';

    Linking.openURL(deepLink).catch(() => {
      Linking.openURL(fallbackLink).catch(() => {
        alert('无法打开QQ，请手动复制群号 1032147823 加入');
      });
    });
  };

  return (
    <SafeAreaView className='flex-1 bg-white dark:bg-gray-900'>
        <BackIcon />

      
      <ScrollView className='w-full px-5 mt-2' showsVerticalScrollIndicator={false}>
        <Text className='text-2xl font-bold text-gray-900 dark:text-white text-left mb-4 mt-2'>帮助与支持</Text>
        {data.map((section, sectionIndex) => (
          <View key={sectionIndex} className='mb-2'>
            <TouchableOpacity 
              className='flex-row justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700'
              onPress={() => toggleSection(sectionIndex)}
              activeOpacity={0.7}
            >
              <Text className='text-lg font-semibold text-gray-900 dark:text-white'>{section.title}</Text>
              {expandedSections[sectionIndex] ? (
                <Icon name="expand-less" size={22} color="#6b7280" />
              ) : (
                <Icon name="expand-more" size={22} color="#6b7280" />
              )}
            </TouchableOpacity>
            
            {expandedSections[sectionIndex] && (
              <View className='mt-3 pl-2'>
                {section.content.map((item, itemIndex) => (
                  <View key={itemIndex} className='mb-3'>
                    <Text className='text-base font-medium text-gray-900 dark:text-white mb-1' selectable={true}>{item.Q}</Text>
                    <Text className='text-sm text-gray-700 dark:text-gray-300' selectable={true}>{item.A}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
        
        <View className='my-6 p-5 bg-gray-100 dark:bg-gray-800 rounded-lg'>
          <Text className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>需要更多帮助？</Text>
          <Text className='text-sm text-gray-700 dark:text-gray-300 mb-3'>如果以上内容未能解决您的问题，请联系我们的客服团队。</Text>
          <View className='flex-row'>
            {/* <TouchableOpacity className='bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded mr-3'>
              <Text className='text-white text-sm'>在线客服</Text>
            </TouchableOpacity> */}
            <TouchableOpacity 
              className='bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded mr-3'
              onPress={handleSendEmail}
            >
              <Text className='text-white text-sm'>发送邮件</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className='bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded mr-3'
              onPress={handleQQqun}
            >
              <Text className='text-white text-sm'>加入QQ客服群</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>  
    </SafeAreaView>
  );
};

export default HelpScreen;