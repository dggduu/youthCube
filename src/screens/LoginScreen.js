import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import InputBox from '../components/inputBox/index';
import { Button, WhiteSpace } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';

const loginAction = (email) => ({
  type: 'LOGIN',
  payload: email,
});

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }

    dispatch(loginAction(email));
    Alert.alert('登录成功', `邮箱: ${email}`, [
      {
        text: '确定',
        onPress: () => navigation.navigate('MainTabNavigator'),
      },
    ]);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="px-8 justify-center flex-grow pt-16 pb-14"
        >
          <Image
            source={require('../assets/logo/ava.png')}
            className="w-28 h-28 self-center mb-10"
            resizeMode="contain"
          />

          <Text
            className={`text-3xl font-bold text-center mb-10 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
          >
            欢迎回来
          </Text>

          <View className="mb-4">
            <InputBox
              label="邮箱地址"
              placeholder="请输入邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIconName="mail"
              isDarkMode={isDark}
            />
          </View>

          <View className="mb-4">
            <InputBox
              label="密码"
              placeholder="请输入密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIconName="lock"
              isDarkMode={isDark}
            />
          </View>

          <Button
            type="primary"
            onPress={handleLogin}
            className="mt-4 py-3 rounded-lg"
          >
            登录
          </Button>

          <WhiteSpace size="lg" />
          <TouchableOpacity
            onPress={() => navigation.navigate('RegisterStart')}
            className="items-center mt-6"
          >
            <Text className={`${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
              没有账号？去注册
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginPage;