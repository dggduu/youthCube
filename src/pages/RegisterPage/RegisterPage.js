// RegisterScreen.js
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

const RegisterPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('提示', '请填写所有字段');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    Alert.alert('注册成功', `用户名: ${username}`);
  };

  return (
    <View style={styles.root}>
      <Image
        source={require("../../assets/logo/ava.png")}
        style={styles.logo}
      />
      <View style={styles.container}>
        <Text style={styles.title}>创建新账号</Text>

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="person" size={24} color="#888" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="用户名"
            value={username}
            onChangeText={setUsername}
          />
        </View>

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

        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <Icon name="lock" size={24} color="#888" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="确认密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <WhiteSpace size="lg" />

        <Button type="primary" onPress={handleRegister} style={styles.loginBtn}>
          注册
        </Button>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>已有账号？去登录</Text>
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
    marginTop: 200,
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

export default RegisterPage;