import axios from 'axios';
import { BASE_INFO } from "../../../constant/base";

const apiClient = axios.create({
  baseURL: BASE_INFO.BASE_URL,
  timeout: 50000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendVerificationCode = async (email) => {
  try {
    console.log("ewhdu");
    // const response = await apiClient.post('/api/send-verification-code', {
    //   email,
    // });
    const response = {
      message: "邮件功能无法使用"
    };
    return { success: true, message: response.data.message };
  } catch (error) {
    return { success: false, error: "服务运行不正常" };
  }
};

export const registerUser = async (userData) => {
  const { name, date, learnStage, email, code, pswd, sex } = userData;

  // 使用默认头像（没有自定义头像功能）
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