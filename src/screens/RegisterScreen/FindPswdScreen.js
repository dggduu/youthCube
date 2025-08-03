import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { BASE_INFO } from "../../constant/base";
import axios from "axios";
import InputBox from "../../components/inputBox/inputBox";
import { SvgXml } from 'react-native-svg';
import { useToast } from "../../components/tip/ToastHooks";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import BackIcon from "../../components/backIcon/backIcon";

// 密码强度校验函数
const isValidPassword = (password) => {
  return {
    value: password,
    isLongEnough: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    isValid: password.length >= 8 &&
             /[A-Z]/.test(password) &&
             /[a-z]/.test(password) &&
             /\d/.test(password) &&
             /[^A-Za-z0-9]/.test(password)
  };
};

// 密码强度提示
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

// 两次密码是否一致提示
const PasswordMatchIndicator = ({ password, confirmPassword }) => {
  if (!password && !confirmPassword) return null;
  const match = password === confirmPassword;
  return (
    <View className="mb-4 ml-2">
      {password || confirmPassword ? (
        <Text className={`text-xs ${match ? 'text-green-500' : 'text-red-500'}`}>
          • 两次输入的密码{match ? '一致' : '不一致'}
        </Text>
      ) : null}
    </View>
  );
};

const FindPswdScreen = () => {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      const response = await axios.get(`${BASE_INFO.BASE_URL}api/captcha-gen`, {
        responseType: 'text',
        headers: {
          'Accept': 'image/svg+xml',
        }
      });
      setCaptchaSvg(response.data);
    } catch (error) {
      showToast('获取验证码失败', 'error');
      console.error('获取验证码错误:', error);
    } finally {
      setCaptchaLoading(false);
    }
  };

  // 发送重置邮件
  const handleSendResetEmail = async () => {
    if (!email) {
      showToast('请输入邮箱地址', 'warning');
      return;
    }
    if (!captcha) {
      showToast('请输入验证码', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_INFO.BASE_URL}api/find-pswd`, {
        email,
        captcha
      });
      showToast(response.data.message || '验证码已发送，请查收', 'success');
      setStep('reset');
    } catch (error) {
      const errorMsg = error.response?.data?.error || '发送验证码失败';
      showToast(errorMsg, 'error');
      fetchCaptcha(); // 刷新验证码
    } finally {
      setLoading(false);
    }
  };

  // 提交重置密码
  const handleResetPassword = async () => {
    if (!verificationCode) {
      showToast('请输入验证码', 'warning');
      return;
    }
    if (!newPassword) {
      showToast('请输入新密码', 'warning');
      return;
    }
    const passwordCheck = isValidPassword(newPassword);
    if (!passwordCheck.isValid) {
      showToast('密码不符合要求，请检查密码规则', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('两次输入的密码不一致', 'warning');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BASE_INFO.BASE_URL}api/reset-pswd`, {
        email,
        code: verificationCode,
        newPassword
      });
      showToast('密码重置成功', 'success');
      navigation.navigate("Login");
    } catch (error) {
      const errorMsg = error.response?.data?.error || '密码重置失败';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={{flex:1}}
    >
    <ScrollView 
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
            <BackIcon/>
        <View className="px-6 py-8">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 'email' ? '找回密码' : '重置密码'}
            </Text>
            <Text className="text-gray-600 dark:text-gray-300 mb-8">
            {step === 'email'
                ? '请输入您的注册邮箱以找回密码'
                : '请输入验证码和新密码以完成重置'}
            </Text>

            {step === 'email' && (
            <>
                <InputBox
                label="邮箱地址"
                placeholder="请输入注册邮箱"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIconName="email"
                />
                
                <View className="flex-row items-center mb-4">
                <View className="flex-1 mr-2">
                    <InputBox
                    label="验证码"
                    placeholder="请输入验证码"
                    value={captcha}
                    onChangeText={setCaptcha}
                    leftIconName="verified"
                    />
                </View>
                
                <TouchableOpacity 
                    onPress={fetchCaptcha}
                    disabled={captchaLoading}
                    className="h-16 w-36 bg-[#f9f9f9] rounded-lg justify-center items-center overflow-hidden mt-3 border border-gray-300 dark:border-gray-600"
                >
                    {captchaLoading ? (
                    <ActivityIndicator size="small" color="#6B7280" />
                    ) : captchaSvg ? (
                    <SvgXml xml={captchaSvg} width="115%" height="120%" />
                    ) : (
                    <Text className="text-gray-500 dark:text-gray-400">获取验证码</Text>
                    )}
                </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                onPress={handleSendResetEmail}
                disabled={loading}
                className="bg-[#409eff] dark:bg-blue-700 py-3 rounded-lg items-center mt-4"
                >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-medium">下一步</Text>
                )}
                </TouchableOpacity>
            </>
            )}

            {step === 'reset' && (
            <>
                <InputBox
                label="新密码"
                placeholder="请输入新密码"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIconName="lock"
                className="mb-2"
                />
                <PasswordStrengthIndicator password={newPassword} />

                <InputBox
                label="确认密码"
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIconName="lock-outline"
                className="mb-2"
                />
                <PasswordMatchIndicator password={newPassword} confirmPassword={confirmPassword} />
                
                <InputBox
                label="验证码"
                placeholder="请输入6位验证码"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                leftIconName="sms"
                className="mb-2"
                />
                
                <TouchableOpacity
                onPress={handleResetPassword}
                disabled={loading}
                className="bg-[#409eff] dark:bg-blue-700 py-3 rounded-lg items-center"
                >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-medium">重置密码</Text>
                )}
                </TouchableOpacity>
            </>
            )}
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
    
  );
};

export default FindPswdScreen;