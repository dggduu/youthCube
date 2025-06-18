import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Button,
  List,
  InputItem,
  DatePicker,
  Picker,
  Text,
  Tooltip,
  Toast,
  WhiteSpace,
} from '@ant-design/react-native';

const GRADES = [
  { label: '小学一年级', value: 'primary_1' },
  { label: '小学二年级', value: 'primary_2' },
  { label: '小学三年级', value: 'primary_3' },
  { label: '小学四年级', value: 'primary_4' },
  { label: '小学五年级', value: 'primary_5' },
  { label: '小学六年级', value: 'primary_6' },
  { label: '初中一年级', value: 'junior_1' },
  { label: '初中二年级', value: 'junior_2' },
  { label: '初中三年级', value: 'junior_3' },
  { label: '高中一年级', value: 'senior_1' },
  { label: '高中二年级', value: 'senior_2' },
  { label: '高中三年级', value: 'senior_3' },
  { label: '大学本科', value: 'undergraduate' },
  { label: '硕士研究生', value: 'master' },
  { label: '博士研究生', value: 'phd' },
];

function ValidatedInput({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  error,
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <Tooltip
      content={<Text style={{ color: 'red', fontSize: 14 }}>{error}</Text>}
      trigger="onPress"
      placement="bottom"
      visible={tooltipVisible}
      onVisibleChange={(visible) => setTooltipVisible(visible)}
    >
      <InputItem
        placeholder={placeholder}
        keyboardType={keyboardType}
        value={value}
        onChange={(text) => {
          onChange(text);
          if (tooltipVisible) setTooltipVisible(false);
        }}
        clear
        onError={() => !!error}
      >
        {label}
      </InputItem>
    </Tooltip>
  );
}

// 强密码判断
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

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const passwordCheck = isValidPassword(value);

  return (
    <Tooltip
      content={
        <View style={styles.tooltipContent}>
          <Text style={!passwordCheck.hasUpperCase ? styles.error : styles.success}>
            • 包含大写字母
          </Text>
          <Text style={!passwordCheck.hasLowerCase ? styles.error : styles.success}>
            • 包含小写字母
          </Text>
          <Text style={!passwordCheck.hasNumber ? styles.error : styles.success}>
            • 包含数字
          </Text>
          <Text style={!passwordCheck.hasSpecialChar ? styles.error : styles.success}>
            • 包含特殊字符
          </Text>
        </View>
      }
      trigger="onPress"
      placement="bottom"
      visible={tooltipVisible}
      onVisibleChange={(visible) => setTooltipVisible(visible)}
    >
      <InputItem
        placeholder={placeholder}
        secureTextEntry
        value={value}
        onChange={(text) => {
          onChange(text);
          if (tooltipVisible) setTooltipVisible(false);
        }}
        onError={() => !isValidPassword(value).valid}
        clear
      >
        {label}
      </InputItem>
    </Tooltip>
  );
}

export default function InputProfile({ route, navigation }) {
  const { useType } = route.params;

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState(null);
  const [grade, setGrade] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [emailError, setEmailError] = useState('');

  // 邮箱格式验证
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 发送验证码
  const sendVerificationCode = () => {
    if (countdown > 0) return;

    let hasError = false;

    if (!email.trim()) {
      setEmailError('请输入邮箱');
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError('邮箱格式不正确');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (hasError) return;

    console.log('发送验证码至:', email);
    setCountdown(60);
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

  // 提交表单
  const onSubmit = () => {
    let hasError = false;

    if (
      !name.trim() ||
      !birthday ||
      !grade ||
      !email.trim() ||
      !code.trim() ||
      !password.trim()
    ) {
      hasError = true;
    }

    if (!isValidEmail(email)) {
      setEmailError('邮箱格式不正确');
      hasError = true;
    }

    if (!isValidPassword(password).valid) {
      hasError = true;
    }

    if (hasError) {
      Toast.show({
        content: '请填写完整信息',
        duration: 0.5,
        mask: false,
      });
      return;
    }

    const formData = { name, birthday, grade, email, code, password };
    console.log('提交的数据:', formData);

    if (useType === 'stu') {
      navigation.navigate('choseLove');
    } else {
      navigation.navigate('boundStu');
    }
  };

  return (
    <View style={styles.container}>
      <List renderHeader="填写个人信息">
        <ValidatedInput
          label="姓名"
          value={name}
          onChange={setName}
          placeholder="请输入姓名"
        />

        <DatePicker
          mode="date"
          value={birthday}
          onChange={(date) => setBirthday(date)}
          extra="请选择出生日期"
        >
          <List.Item arrow="horizontal">出生日期</List.Item>
        </DatePicker>

        <Picker
          data={GRADES}
          cols={1}
          value={grade}
          onChange={(value) => setGrade(value)}
        >
          <List.Item arrow="horizontal">学年</List.Item>
        </Picker>

        <ValidatedInput
          label="邮箱"
          value={email}
          onChange={setEmail}
          placeholder="请输入邮箱"
          keyboardType="email-address"
          error={emailError}
        />

        <InputItem
          placeholder="验证码"
          value={code}
          onChange={setCode}
          clear
          extra={
            <TouchableOpacity
              onPress={sendVerificationCode}
              disabled={countdown > 0}
              style={[
                styles.codeButton,
                countdown > 0 && styles.codeButtonDisabled,
              ]}
            >
              <Text style={styles.codeButtonText}>
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Text>
            </TouchableOpacity>
          }
        >
          验证码
        </InputItem>

        <PasswordInput
          label="密码"
          value={password}
          onChange={setPassword}
          placeholder="请输入密码"
        />
      </List>

      <WhiteSpace size="lg" />
      <Button type="primary" onPress={onSubmit}>
        下一步
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  codeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  codeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  codeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  tooltipContent: {
    padding: 3,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#e8e8e8',
    width: 100,
  },
  error: {
    color: 'red',
    fontSize: 13,
  },
  success: {
    color: 'green',
    fontSize: 13,
  },
});