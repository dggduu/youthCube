// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';

const LoginPage = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }

  Alert.alert('登录成功', `邮箱: ${email}`, [
      {
        text: '确定',
        onPress: () => {
          dispatch(loginSuccess());
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <Image
        source={require("../../assets/logo/ava.png")}
        style={styles.logo}
      />
      <View style={styles.container}>
        <Text style={styles.title}>欢迎回来</Text>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="email" size={24} color="#888" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="邮箱地址"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="lock" size={24} color="#888" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <WhiteSpace size="lg" />
        <Button type="primary" onPress={handleLogin} style={styles.loginBtn}>
          登录
        </Button>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>没有账号？去注册</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    height: 100,
    width: 100,
    marginTop:200,
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 20,
  },
  iconContainer: {
    width: 30,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  loginBtn: {
    marginTop: 10,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#4A90E2',
  },
});

export default LoginPage;