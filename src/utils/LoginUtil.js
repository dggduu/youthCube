import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import ENV, { BASE_INFO } from "../constant/base";
import setupAuthInterceptors from "../utils/axios/AuthInterceptors";
import { getItemFromAsyncStorage } from "../utils/LocalStorage";
import store from "../store/auth/authStore";
import { logout } from "../store/auth/authSlice";
const axiosClient = axios.create({
    baseURL: BASE_INFO.BASE_URL + 'api',
    timeout: 10000,
    headers: {
        "Content-Type": 'application/json',
    },
});

// 针对刷新接口403的拦截器
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // 判断是否是 /refresh_token 请求
    if (config.url === '/refresh_token') {
      if (response && (response.status === 401 || response.status === 403)) {
        console.warn("刷新 token 失败，refresh token 可能已过期");

        store.dispatch(logout());

        return Promise.reject(new Error('refresh_token 失效'));
      }
    }
    return Promise.reject(error);
  }
);

export const getAccessTokenByLogin = async (loginData) => {
    try {
        console.log("test:",BASE_INFO.BASE_URL + 'api');
        const response = await axiosClient.post('/login', loginData);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('登录失败:', error.response.data.error || error.response.data.message);
            throw new Error(error.response.data.error || error.response.data.message || '登录失败');
        } else if (error.request) {
            console.error('登录请求无响应:', error.request);
            throw new Error('网络错误，请检查您的连接');
        } else {
            // 其他错误
            console.error('登录时发生未知错误:', error.message);
            throw new Error('登录时发生未知错误');
        }
    }
};

export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axiosClient.post('/refresh_token', { refreshToken });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('刷新令牌失败:', error.response.data.error || error.response.data.message);
            throw new Error(error.response.data.error || error.response.data.message || '刷新令牌失败');
        } else if (error.request) {
            console.error('刷新令牌请求无响应:', error.request);
            throw new Error('网络错误，请检查您的连接');
        } else {
            console.error('刷新令牌时发生未知错误:', error.message);
            throw new Error('刷新令牌时发生未知错误');
        }
    }
};

export const checkAuthExpire = async () => {
    try {
        const accessToken = await getItemFromAsyncStorage('accessToken');
        console.log("现在正在检查密钥");
        if (!accessToken) throw new Error('无可用的密钥');

        const response = await axiosClient.get('/auth/status', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        // 如果是401/403错误，直接抛出
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log("抛出403");
            throw error;
        }
        throw new Error('检查认证状态失败');
    }
};