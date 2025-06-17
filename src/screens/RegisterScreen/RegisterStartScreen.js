import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';

const RegisterStartScreen = ({ navigation }) => {

  const handleStartRegistration = () => {
    navigation.navigate('VerifyPhone');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>欢迎注册</Text>
      <WhiteSpace size="lg" />
      <Button type="primary" onPress={handleStartRegistration} style={styles.startBtn}>
        开始注册
      </Button>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>已有账号？返回登录</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
  startBtn: {
    marginVertical: 20,
  },
  link: {
    textAlign: 'center',
    color: '#4A90E2',
    marginTop: 20,
  },
});

export default RegisterStartScreen;