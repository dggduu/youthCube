import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import InputBox from '../../components/inputBox/inputBox';
import BackIcon from '../../components/backIcon/backIcon';
import { registerUser } from '../RegisterScreen/utils/registerUtils';
import { GRADES } from '../../constant/index';
import { useToast } from '../../components/tip/ToastHooks';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import CustomPicker from '../../components/custom/Custompicker';

// 密码验证逻辑
const isValidPassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  return {
    valid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    isLongEnough,
  };
};

// 密码强度展示组件
const PasswordStrengthIndicator = ({ password }) => {
  const check = isValidPassword(password);
  const getColor = (isValid) => {
    if (password.length === 0) return 'text-gray-400';
    return isValid ? 'text-green-500' : 'text-[#f56c6c]';
  };
  const getIcon = (isValid) => {
    if (password.length === 0) return '•';
    return isValid ? '✓' : '✗';
  };

  return (
    <View className="mb-4 ml-2">
      <Text className={`text-xs mb-1 ${getColor(check.isLongEnough)}`}>
        {getIcon(check.isLongEnough)} 至少8个字符
      </Text>
      <Text className={`text-xs mb-1 ${getColor(check.hasUpperCase)}`}>
        {getIcon(check.hasUpperCase)} 包含大写字母
      </Text>
      <Text className={`text-xs mb-1 ${getColor(check.hasLowerCase)}`}>
        {getIcon(check.hasLowerCase)} 包含小写字母
      </Text>
      <Text className={`text-xs mb-1 ${getColor(check.hasNumber)}`}>
        {getIcon(check.hasNumber)} 包含数字
      </Text>
      <Text className={`text-xs mb-1 ${getColor(check.hasSpecialChar)}`}>
        {getIcon(check.hasSpecialChar)} 包含特殊字符
      </Text>
    </View>
  );
};

const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
  { label: '不想说', value: 'idk' },
];

export default function InputProfile({ route }) {
  const navigation = useNavigation();
  const { useType } = route.params || {};

  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [grade, setGrade] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [formError, setFormError] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { showToast } = useToast();

  useEffect(() => {
    setGrade('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFormError('');
    setPasswordMatchError('');
  }, [useType]);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthday(currentDate);
  };

  const onSubmit = async () => {
    setFormError('');
    setPasswordMatchError('');

    console.log(name);
    if (!name.trim() || !grade || !email.trim() || !password.trim() || !gender.trim()) {
      showToast('请填写完整信息', 'error');
      return;
    }

    if (!isValidPassword(password).valid) {
      showToast('密码不符合要求', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMatchError('两次输入的密码不一致');
      showToast('两次输入的密码不一致', 'error');
      return;
    }

    const date = `${birthday.getFullYear()}-${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`;
    const formData = {
      name,
      date,
      learnStage: grade,
      email,
      pswd: password,
      sex: gender === 'male' ? '男' : gender === 'female' ? '女' : '不想说',
    };

    try {
      showToast('正在注册...', 'info');
      const result = await registerUser(formData);
      if (result.success) {
        showToast('账号创建成功！', 'success');
        navigation.navigate('Login');
      } else {
        showToast(result.error || '注册失败，请重试', 'error');
      }
    } catch (error) {
      showToast('网络错误，请稍后重试', 'error');
    }
  };

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMatchError('两次输入的密码不一致');
    } else {
      setPasswordMatchError('');
    }
  }, [confirmPassword, password]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <BackIcon isDark={isDarkMode} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-12 pb-20">
          <Text className={`text-2xl font-bold text-center mb-5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            填写个人信息
          </Text>

          <InputBox label="昵称" placeholder="请输入昵称" value={name} onChangeText={setName} leftIconName="person" />
          
          <View className="mb-4">
            <CustomPicker label="性别" options={GENDER_OPTIONS} selectedValue={gender} onValueChange={setGender} placeholder="请选择性别" />
          </View>
          
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className={`flex-row items-center p-4 rounded-lg border mb-4 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}
          >
            <MaterialIcons name="cake" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} style={{ marginRight: 10 }} />
            <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              出生日期：<Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{birthday.toLocaleDateString()}</Text>
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

          <View className="mb-4">
            <CustomPicker label="学年" options={GRADES} selectedValue={grade} onValueChange={setGrade} placeholder="请选择学年" />
          </View>

          {/* 联系邮箱 */}
          <InputBox 
            label="联系邮箱" 
            placeholder="请输入邮箱" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            leftIconName="email" 
          />
          
          <InputBox 
            label="密码" 
            placeholder="请输入密码" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            leftIconName="lock" 
          />
          {password && <PasswordStrengthIndicator password={password} />}

          <InputBox 
            label="确认密码" 
            placeholder="请再次输入密码" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry 
            leftIconName="lock" 
          />
          {passwordMatchError ? (
            <Text className="text-[#f56c6c] text-xs ml-2">•{passwordMatchError}</Text>
          ) : null}

          <TouchableOpacity
            onPress={onSubmit}
            disabled={!isValidPassword(password).valid || password !== confirmPassword}
            className={`py-4 rounded-lg items-center justify-center mt-8 ${
              isValidPassword(password).valid && password === confirmPassword 
                ? 'bg-[#409eff]' 
                : 'bg-gray-400 dark:bg-gray-700'
            }`}
          >
            <Text className="text-white dark:text-gray-300 font-semibold text-lg">完成注册</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('helpSolvor')} className="mt-6 self-center">
            <Text className={`font-semibold text-[#409eff]`}>有问题？联系工作人员</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


