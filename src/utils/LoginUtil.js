import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import ENV, { BASE_INFO } from "../constant/base";

const axiosClient = axios.create({
    baseURL: BASE_INFO.BASE_URL + 'api',
    timeout: 10000,
    headers: {
        "Content-Type": 'application/json',
    },
});

/**
 * 登录函数，通过邮箱和密码获取访问令牌和刷新令牌
 * @param {object} userAuthInfo - 包含 email 和 pswd 的用户认证信息
 * @returns {Promise<object | null>} 成功时返回包含 accessToken, refreshToken, user 数据的对象，失败时返回 null
 */
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

/**
 * 刷新访问令牌函数
 * @param {string} refreshToken - 用户当前的刷新令牌
 * @returns {Promise<string | null>} 成功时返回新的 accessToken，失败时返回 null
 */
export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axiosClient.post('/refresh_token', { refreshToken });
        return response.data.accessToken;
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