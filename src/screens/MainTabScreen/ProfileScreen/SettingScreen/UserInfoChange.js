import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  useColorScheme,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingViewBase
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import InputBox from '../../../../components/inputBox/index';
import { Picker } from '@react-native-picker/picker';
import BackIcon from "../../../../components/backIcon/backIcon";
import { GRADES } from "../../../../constant/index";
import { useToast } from "../../../../components/tip/ToastHooks";
import { BASE_INFO } from "../../../../constant/base";
import { updateProfile } from '../../../../store/auth/authSlice';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from 'react-native-safe-area-context';
const isValidPassword = (password) => {
  if (!password) return { valid: false };
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

const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;
  const check = isValidPassword(password);
  return (
    <View className="mb-4 ml-2">
      <Text className={`text-xs mb-1 ${check.isLongEnough ? 'text-green-500' : 'text-red-500'}`}>
        • 长度至少8位
      </Text>
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

const PasswordMatchIndicator = ({ password, confirmPassword }) => {
  if (!password && !confirmPassword) return null;
  const match = password === confirmPassword;
  return (
    <View className="mb-4 ml-2">
      {password && confirmPassword ? (
        <Text className={`text-xs ${match ? 'text-green-500' : 'text-red-500'}`}>
          • 两次输入的密码{match ? '一致' : '不一致'}
        </Text>
      ) : null}
    </View>
  );
};

const UserInfoChange = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const { userData, accessToken, loading: authLoading } = useSelector(state => state.auth);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [learnStage, setLearnStage] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [newPassword, setNewPassword] = useState(''); 
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("CurrentUserData:", userData);
    if (userData) {
      setName(userData.name || '');
      if (userData.sex === '男') {
        setGender('male');
      } else if (userData.sex === '女') {
        setGender('female');
      } else {
        setGender('idk');
      }

      if (userData.birth_date) {
        setBirthday(new Date(userData.birth_date));
      }
      setLearnStage(userData.learn_stage || '');
      setEmail(userData.email || '');
      setBio(userData.bio || '');
    }
  }, [userData]);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthday(currentDate);
  };

  const handleSubmit = async () => {
    setFormError('');
    setIsSubmitting(true);

    if (!name.trim() || !gender.trim() || !learnStage.trim() || !email.trim()) {
      showToast(`请填写完整信息\n除密码外所有必填`,"error");
      setIsSubmitting(false);
      return;
    }
    if (!isValidEmail(email)) {
      showToast('邮箱格式不正确',"error");
      setIsSubmitting(false);
      return;
    }

    let passwordPayload = {};
    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        showToast('两次输入的新密码不一致',"error");
        setIsSubmitting(false);
        return;
      }
      const passwordCheck = isValidPassword(newPassword);
      if (!passwordCheck.valid) {
        showToast('新密码不符合要求',"error");
        setIsSubmitting(false);
        return;
      }
      passwordPayload = { password: newPassword };
    }

    const formattedBirthday = `${birthday.getFullYear()}-${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`;
    const sexForBackend = gender === 'male' ? '男' : gender === 'female' ? '女' : '不想说';

    const updatedData = {
      name,
      birth_date: formattedBirthday,
      learn_stage: learnStage,
      email,
      sex: sexForBackend,
      bio,
      ...passwordPayload,
      avatar_key: userData?.avatar_key,
      is_member: userData?.is_member,
      team_id: userData?.team_id,
    };

    console.log("提交的更新数据:", updatedData);

    try {
      if (!userData?.id || !accessToken) {
        showToast("用户信息或认证令牌缺失，无法更新。", "error");
        setIsSubmitting(false);
        return;
      }

      const resultAction = await dispatch(updateProfile({
        userId: userData.id,
        token: accessToken,
        userData: updatedData
      }));

      if (updateProfile.fulfilled.match(resultAction)) {
        showToast('个人信息更新成功！', 'success');
        navigation.goBack();
      } else if (updateProfile.rejected.match(resultAction)) {
        showToast('个人信息更新失败', 'error');
      }
    } catch (error) {
      console.error('更新个人信息时发生错误:', error);
      showToast('网络或服务器错误，请稍后再试',"error");
      showToast('网络或服务器错误', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async () => {
    showToast('此功能暂未实现：修改邮箱需重新发送验证码。', 'info');
  };

  if (authLoading && !userData) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-800">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-700 dark:text-gray-300 text-base">正在加载当前资料...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-800 p-4">
        <Text className="text-red-600 dark:text-red-400 text-lg text-center">无法获取用户资料。请确保已登录。</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} className="mt-4 px-6 py-3 bg-[#409eff] rounded-lg">
          <Text className="text-white font-semibold">去登录</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <BackIcon isDark={isDarkMode} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        
        <View className="px-4 pt-6 mb-20">
          <Text
            className={`text-2xl font-bold text-center mb-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}
          >
            修改个人信息
          </Text>
          {formError ?
            <Text className="text-red-500 pl-1 font-normal text-lg self-center mb-4">
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
          <View className="mb-4">
            <Text
              className={`mb-3 ml-1 font-normal ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              出生日期
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className={`p-4 rounded-lg border ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
              } flex-row justify-between items-center`}
            >
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {birthday.toLocaleDateString()}
              </Text>
              <Text className={`${isDarkMode ? 'text-[#409eff]' : 'text-blue-600'}`}>选择日期</Text>
            </TouchableOpacity>
          </View>

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

          {/* 学年选择 */}
          <View className="mb-4">
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
                selectedValue={learnStage}
                onValueChange={(value) => setLearnStage(value)}
                style={{
                  color: isDarkMode ? 'white' : 'gray',
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  height: 60,
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

          {/* 个人简介 */}
          <View className="mb-4 mt-4">
            <Text
              className={`mb-3 ml-1 font-normal ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              个人简介
            </Text>
            <TextInput
              placeholder="简单介绍一下自己..."
              placeholderTextColor={isDarkMode ? '#A0AEC0' : '#A0AEC0'}
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
              className={`w-full p-4 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-black'
              } text-base`}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </View>

          {/* 密码修改区 */}
          <View className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              修改密码
            </Text>
            <InputBox
              label="新密码"
              placeholder="留空则不修改密码"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              leftIconName="lock"
            />
            <PasswordStrengthIndicator password={newPassword} />
            <InputBox
              label="确认新密码"
              placeholder="请再次输入新密码"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              secureTextEntry
              leftIconName="lock"
            />
            {newPassword || confirmNewPassword ? (
                <PasswordMatchIndicator 
                    password={newPassword} 
                    confirmPassword={confirmNewPassword} 
                />
            ) : null}
          </View>

          {/* 保存按钮 */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || authLoading}
            className={`py-3 rounded-lg items-center justify-center mt-8 ${
              isSubmitting || authLoading ? 'bg-gray-300 dark:bg-gray-700' : 'bg-[#409eff]'
            }`}
          >
            {isSubmitting || authLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">保存修改</Text>
            )}
          </TouchableOpacity>

          {/* 联系工作人员 */}
          <TouchableOpacity onPress={() => navigation.navigate('HelpScreen')}>
            <View>
              <Text className={`mt-6 self-center font-semibold ${isDarkMode ? 'text-[#409eff]' : 'text-[#409eff]'}`}>
                有问题？联系工作人员
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UserInfoChange;