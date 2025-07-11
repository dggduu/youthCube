import axios from 'axios';
import { BASE_INFO } from "../../../constant/base";

const apiClient = axios.create({
  baseURL: BASE_INFO.BASE_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 发送验证码
 * @param {string} email 邮箱
 */
export const sendVerificationCode = async (email) => {
  try {
    const response = await apiClient.post('/api/send-verification-code', {
      email,
    });
    return { success: true, message: response.data.message };
  } catch (error) {
    const errorMessage = error.response?.data?.error 
      || `${email}:发送验证码失败，请稍后再试`;
    return { success: false, error: errorMessage };
  }
};

/**
 * 注册新用户
 * @param {Object} userData 用户数据
 * @param {string} userData.name 姓名
 * @param {string} userData.date 出生日期
 * @param {string} userData.learnStage 学年
 * @param {string} userData.email 邮箱
 * @param {string} userData.code 验证码
 * @param {string} userData.pswd 密码
 * @param {string} [userData.sex] 性别（男、女、不想说）
 */
export const registerUser = async (userData) => {
  const { name, date, learnStage, email, code, pswd, sex } = userData;

  // 使用默认头像
  const defaultGravasterUrl = ''
  const payload = {
    name,
    date,
    learnStage,
    email,
    code,
    pswd,
    sex,
    ava_url: defaultGravasterUrl,
  };

  try {
    const response = await apiClient.post('/api/register', payload);
    return { success: true, data: response.data };
  } catch (error) {
    console.log('注册失败:', JSON.stringify({
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    }, null, 2));
    const errorMessage = error.response?.data?.error 
      || '注册失败，请稍后再试';
    return { success: false, error: errorMessage };
  }
};