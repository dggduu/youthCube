import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity,Image } from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';
import { Screen } from 'react-native-screens';

const RegisterStartScreen = ({ navigation }) => {

  return (
    <View style={styles.root}>
      <Text style={styles.title}>欢迎注册</Text>
      <WhiteSpace size="lg" />

      <View style={styles.identifyContainer}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('registerFlow', {
              screen: 'inputProfile',
              params: { useType: 'stu' },
            })
          }
        >
          <View style={styles.identifyElem}>
            <Image
                style={styles.identifyImg}
                source={require('../../assets/registerScreen/stu.png')}
              />
            <Text style={styles.identifyText}>我是学生</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('registerFlow', {
              screen: 'inputProfile',
              params: { useType: 'stu' },
            })
          }
        >
          <View style={styles.identifyElem}>
            <Image
                style={styles.identifyImg}
                source={require('../../assets/registerScreen/family.png')}
              />
            <Text style={styles.identifyText}>我是家长</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('registerFlow', {
              screen: 'inputProfile',
              params: { useType: 'stu' },
            })
          }
        >
          <View style={styles.identifyElem}>
            <Image
                style={styles.identifyImg}
                source={require('../../assets/registerScreen/teacher.png')}
              />
            <Text style={styles.identifyText}>我是导师</Text>
          </View>
        </TouchableOpacity>
      </View>

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
    marginBottom: 20,
  },
  startBtn: {
    marginVertical: 20,
  },
  link: {
    textAlign: 'center',
    color: '#4A90E2',
    marginTop: 20,
  },
  identifyText: {
    fontSize: 16,
    fontWeight:600,
  },
  identifyElem:{
    alignItems: 'center',
    paddingVertical:15,
  },identifyContainer: {

  },identifyImg: {
    width:80,
    height:80,
    marginBottom: 10,
  },
});

export default RegisterStartScreen;