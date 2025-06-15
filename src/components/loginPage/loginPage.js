// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱和密码');
      return;
    }

    Alert.alert('登录成功', `邮箱: ${email}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎回来</Text>

      {/* 邮箱输入 */}
      <View style={styles.inputContainer}>
        <Icon name="email" size={24} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="邮箱地址"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* 密码输入 */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#888" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="密码"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <WhiteSpace size="lg" />

      {/* 登录按钮 */}
      <Button type="primary" onPress={handleLogin} style={styles.loginBtn}>
        登录
      </Button>

      {/* 注册链接 */}
      <TouchableOpacity onPress={() => Alert.alert('跳转到注册页')}>
        <Text style={styles.link}>没有账号？去注册</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
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
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
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