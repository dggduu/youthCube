import React from 'react';
import { View, Text, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterStartScreen = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const RoleButton = ({ title, imageSource, onPress }) => (
    <TouchableOpacity onPress={onPress} className="items-center mb-14">
      <View className="items-center">
        <Image
          source={imageSource}
          className="w-28 h-28 self-center"
          resizeMode="contain"
        />
        <Text className={`text-center font-normal text-lg mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'} px-5`}>
      <View className="mt-40">
        <Text
          className={`text-3xl font-bold text-center mb-10 ${isDark ? 'text-white' : 'text-gray-800'}`}
        >
          欢迎注册
        </Text>

        <View className="items-center">
          <RoleButton
            title="我是学生"
            imageSource={require('../../assets/registerScreen/stu.png')}
            onPress={() =>
              navigation.navigate('registerFlow', {
                screen: 'inputProfile',
                params: { useType: 'student' },
              })
            }
          />

          <RoleButton
            title="我是家长"
            imageSource={require('../../assets/registerScreen/family.png')}
            onPress={() =>
              navigation.navigate('registerFlow', {
                screen: 'inputProfile',
                params: { useType: 'parent' },
              })
            }
          />

          <RoleButton
            title="我是导师"
            imageSource={require('../../assets/registerScreen/teacher.png')}
            onPress={() =>
              navigation.navigate('registerFlow', {
                screen: 'inputProfile',
                params: { useType: 'teacher' },
              })
            }
          />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text
            className={`text-center font-normal text-sm ${isDark ? 'text-blue-500' : 'text-blue-400'}`}
          >
            已有账号？返回登录
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegisterStartScreen;