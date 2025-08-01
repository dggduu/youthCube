import React, { useState, useEffect, use } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  useColorScheme,
  ScrollView,
  Alert
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import InputBox from '../../components/inputBox/inputBox';
import { Picker } from '@react-native-picker/picker';;
import BackIcon from "../../components/backIcon/backIcon";
import{ registerUser,sendVerificationCode } from "../RegisterScreen/utils/registerUtils";
import { GRADES } from "../../constant/index";
import { useToast } from "../../components/tip/ToastHooks";
import {BASE_INFO} from "../../constant/base"; // 引入全局常量

// 密码验证逻辑
const isValidPassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  return {
    valid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
};

// 密码强度展示组件
const PasswordStrengthIndicator = ({ password }) => {
  const check = isValidPassword(password);
  return (
    <View className="mb-4 ml-2">
      <Text className={`text-xs mb-1 ${check.hasUpperCase ? 'text-green-500' : 'text-red-500'}`}>
        • 包含大写字母
      </Text>
      <Text className={`text-xs mb-1 ${check.hasLowerCase ? 'text-green-500' : 'text-red-500'}`}>
        • 包含小写字母
      </Text>
      <Text className={`text-xs mb-1 ${check.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
        • 包含数字
      </Text>
      <Text className={`text-xs mb-1 ${check.hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
        • 包含特殊字符
      </Text>
    </View>
  );
};


export default function InputProfile({ route }) {
  const navigation = useNavigation();
  const { useType } = route.params || {};

  // 状态管理
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [grade, setGrade] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const { showToast } = useToast;
  useEffect(() => {
    setGrade('');

    // 再次进入界面时重置变量
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEmailError('');
    setFormError('');
  }, [useType]);

  // 邮箱格式验证
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  // DatePickerChange
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthday(currentDate);
  };

  // 倒计时逻辑
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (countdown > 0) return;

    let hasError = false;

    if (!email.trim()) {
      setEmailError('请输入邮箱');
      showToast('网络错误','error');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError('邮箱格式不正确');
      showToast('网络错误','error');
      hasError = true;
    } else {
      setEmailError('');
    }
    
    if (hasError) return;

    console.log('发送验证码至:', email);
    try {
      const result = await sendVerificationCode(email);
      console.log("res",result);
      if (result.success) {
        showToast('验证码已发送', 'success');
        setCountdown(60); // 启动倒计时
      } else {
        showToast("邮件发送失败", 'error');
        Alert.alert("error");
      }
    } catch (error) {
      showToast('网络错误', 'error');
    }
  };

  // 提交表单
  const onSubmit = async () => {

    let hasError = false;

    if (!name.trim() || !grade || !email.trim() || !code.trim() || !password.trim() || !gender.trim()) {
      setFormError('请填写完整信息');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('邮箱格式不正确');
      hasError = true;
    }

    if (!isValidPassword(password).valid) {
      setFormError('密码不符合要求');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setFormError('两次输入的密码不一致');
      return;
    }

    if (hasError) return;

    const date = `${birthday.getFullYear()}-${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`;

    const formData = {
      name,
      date,
      learnStage: grade,
      email,
      code,
      pswd: password,
      sex: gender === 'male' ? '男' : gender === 'female' ? '女' : '不想说',
    };

    console.log('提交的数据:', formData);

    const result = await registerUser(formData);
    if (result.success) {
      navigation.navigate('Login');
      showToast("创建账号成功！","success");
    } else {
      setFormError(result.error || '注册失败，请重试');
    }
  };

    return (
    <KeyboardAvoidingView
      behavior='padding'
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <BackIcon isDark={false}/>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4 pt-6 mt-8 mb-20">
          <Text
            className={`text-2xl font-bold text-center mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}
          >
            填写个人信息
          </Text>
          {formError ?
            <Text className="text-red-500 pl-1 font-normal text-lg self-center">
              {formError}
            </Text> : null}
          {/* 昵称 */}
          <InputBox
            label="昵称"
            placeholder="请输入昵称"
            value={name}
            onChangeText={setName}
            leftIconName="person"
          />

          {/* 性别选择 */}
          <View className="mb-4">
            <Text
              className={`mb-3 ml-1 font-normal ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              性别
            </Text>
            <View
              className={`p-0 pl-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
            >
              <Picker
                selectedValue={gender}
                onValueChange={(value) => setGender(value)}
                style={{
                  color: isDarkMode ? 'white' : 'gray',
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                }}
                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                mode="dropdown"
              >
                <Picker.Item label="请选择性别" value="" enabled={false} />
                <Picker.Item label="男" value="male" />
                <Picker.Item label="女" value="female" />
                <Picker.Item label="不想说" value="idk" />
              </Picker>
            </View>
          </View>

          {/* 出生日期选择 */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className={`p-5 rounded-lg border mb-4 ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
            }`}
          >
            <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              出生日期：{birthday.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={birthday}
              mode="date"
              display="default"
              onChange={onDateChange}
              themeVariant={isDarkMode ? 'dark' : 'light'}
            />
          )}

          <View className="mb-4" key={useType}>
            <Text
              className={`mb-3 ml-1 font-normal ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              学年
            </Text>
            <View
              className={`p-1 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
              }`}
            >
              <Picker
                key={useType}
                selectedValue={grade}
                onValueChange={(value) => setGrade(value)}
                style={{
                  color: isDarkMode ? 'white' : 'gray',
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  height:55,
                }}
                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                mode="dropdown"
              >
                <Picker.Item label="请选择学年" value="" enabled={false} />
                {GRADES.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 邮箱 */}
          <InputBox
            label="邮箱"
            placeholder="请输入邮箱"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            leftIconName="email"
          />

          {/* 验证码 */}
          <View className="mb-4">
            <Text
              className={`mb-3 ml-1 font-normal ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              验证码
            </Text>
            <View className="flex-row items-center border rounded-lg overflow-hidden border-gray-300 dark:border-gray-600">
              <TextInput
                placeholder="请输入验证码"
                value={code}
                style={{height:55}}
                onChangeText={setCode}
                className={`flex-1 pl-5 ${
                  isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-black'
                }`}
              />
              <TouchableOpacity
                onPress={handleSendCode}
                disabled={countdown > 0}
                className={`px-3 justify-center rounded-r-lg h-16 ${
                  countdown > 0 ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-500'
                }`}
              >
                <Text
                  className={`${
                    isDarkMode ? 'text-white' : 'text-white'
                  }`}
                >
                  {countdown > 0 ? `${countdown}s后重新获取` : '获取验证码'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 密码 */}
          <InputBox
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIconName="lock"
          />

          <PasswordStrengthIndicator password={password} />
          {/* 确认密码 */}
          <InputBox
            label="确认密码"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIconName="lock"
          />

          {/* 下一步 */}
          <TouchableOpacity
            onPress={onSubmit}
            disabled={(!password || !isValidPassword(password).valid)}
            className={`py-3 rounded-lg items-center justify-center mt-5 ${
              (password && isValidPassword(password).valid)
                ? 'bg-blue-500'
                : 'bg-gray-400'
            }`}
          >
            <Text className="text-white font-semibold text-base">完成注册</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{
            navigation.navigate('helpSolvor');
          }}>
            <View>
              <Text className= {`mt-6 self-center font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`}>有问题？联系工作人员</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}