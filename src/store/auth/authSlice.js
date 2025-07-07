import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAccessTokenByLogin,
    refreshAccessToken,
    checkAuthExpire
} from '../../utils/LoginUtil';
import {
    setItemToAsyncStorage,
    removeItemFromAsyncStorage,
    getItemFromAsyncStorage
} from '../../utils/LocalStorage';
import axios from 'axios';

import { BASE_INFO } from "../../constant/base";
import { stopUpload } from 'react-native-fs';



export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ userId, token, userData }, { rejectWithValue, dispatch }) => {
        try {
            console.log("Test:",`${BASE_INFO.BASE_URL}api/users/${userId}`,`Bearer ${token}`);
            const response = await axios.put(`${BASE_INFO.BASE_URL}api/users/${userId}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                const updatedUser = response.data.user;
                await setItemToAsyncStorage('currentUser', updatedUser);
                return updatedUser;
            } else {
                return rejectWithValue(response.data.message || '更新用户资料失败。');
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
            const errorMessage = error.response?.data?.message || error.message || '网络或服务器错误。';
            return rejectWithValue(errorMessage);
        }
    }
);

export const fetchUserInfo = createAsyncThunk(
    'auth/fetchUserInfo',
    async (userId, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const accessToken = auth.accessToken;
            
            const response = await fetch(`${BASE_INFO.BASE_URL}api/users/${userId}`);
            
            if (!response.ok) {
                throw new Error('获取用户信息失败');
            }
            
            const userData = await response.json();
            console.log("UserData: ",userData);
            await setItemToAsyncStorage('user', userData);
            
            return userData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, pswd }, { rejectWithValue }) => {
        try {
            const response = await getAccessTokenByLogin({ email, pswd });
            await setItemToAsyncStorage('accessToken', response.accessToken);
            await setItemToAsyncStorage('refreshToken', response.refreshToken);
            return response;
        } catch (error) {
            const errorMessage = error.message || '登录失败，请检查网络或凭据。';
            return rejectWithValue(errorMessage);
        }
    }
);

export const refreshAuthToken = createAsyncThunk(
    'auth/refreshAuthToken',
    async (_, { getState, rejectWithValue }) => {
        const { auth } = getState();
        const currentRefreshToken = auth.refreshToken || (await getItemFromAsyncStorage('refreshToken'));

        if (!currentRefreshToken) {
            return rejectWithValue('没有刷新令牌，请重新登录。');
        }

        try {
            const response = await refreshAccessToken(currentRefreshToken);
            await setItemToAsyncStorage('accessToken', response.accessToken );
            await setItemToAsyncStorage('refreshToken', response.refreshToken );
            return response.accessToken;
        } catch (error) {
            const errorMessage = error.message || '刷新令牌失败，请重新登录。';
            await removeItemFromAsyncStorage('accessToken');
            await removeItemFromAsyncStorage('refreshToken');
            await removeItemFromAsyncStorage('user');
            return rejectWithValue(errorMessage);
        }
    }
);

export const loadAuthData = createAsyncThunk(
    'auth/loadData',
    async (_, { rejectWithValue, dispatch }) => {
        try { 
            const accessToken = await getItemFromAsyncStorage('accessToken');
            const refreshToken = await getItemFromAsyncStorage('refreshToken');
            const user = await getItemFromAsyncStorage('user');
            console.log(accessToken, refreshToken);
            if (!accessToken || !refreshToken || !user) {
                return null;
            }

            try {
                // 检查token是否有效
                await checkAuthExpire();
                return { accessToken, refreshToken, user };
            } catch (error) {
                // 如果检查失败，尝试刷新token
                try {
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
                        await refreshAccessToken(refreshToken);
                    
                    await setItemToAsyncStorage('accessToken', newAccessToken);
                    await setItemToAsyncStorage('refreshToken', newRefreshToken);
                    
                    return { 
                        accessToken: newAccessToken, 
                        refreshToken: newRefreshToken, 
                        user 
                    };
                } catch (refreshError) {
                    // 刷新也失败，清除所有token
                    await removeItemFromAsyncStorage('accessToken');
                    await removeItemFromAsyncStorage('refreshToken');
                    await removeItemFromAsyncStorage('user');
                    
                    // 这里不需要跳转，由拦截器处理
                    return null;
                }
            }
        } catch (error) {
            console.error('从 AsyncStorage 加载认证数据失败:', error);
            await removeItemFromAsyncStorage('accessToken');
            await removeItemFromAsyncStorage('refreshToken');
            await removeItemFromAsyncStorage('user');
            return rejectWithValue('加载认证数据失败。');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        accessToken: null,
        refreshToken: null,
        userData: {
            id: null,
            name: null,
            birth_date: null,
            learn_stage: null,
            email: null,
            sex: null,
            avatar_key: null,
            bio: null,
            team_id: null,
            is_member: null,
            posts: [],
            team: null
        },
        isAuthenticated: false,
        loading: false,
        error: null,
        isAuthReady: false,
    },
    reducers: {
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.userData = {
                id: null,
                name: null,
                birth_date: null,
                learn_stage: null,
                email: null,
                sex: null,
                avatar_key: null,
                bio: null,
                team_id: null,
                is_member: null,
                posts: [],
                team: null
            };
            state.isAuthenticated = false;
            state.error = null;
            removeItemFromAsyncStorage('accessToken');
            removeItemFromAsyncStorage('refreshToken');
            removeItemFromAsyncStorage('user');
        },
        clearAuthError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.userData = action.payload.user; 
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || '登录失败';
                state.isAuthenticated = false;
                state.accessToken = null;
                state.refreshToken = null;
                state.userData = {
                    id: null, email: null, is_member: null, learn_stage: null,
                    sex: null, ava_url: null,
                };
            })
            .addCase(refreshAuthToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshAuthToken.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(refreshAuthToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || '刷新令牌失败';
                state.isAuthenticated = false;
                state.accessToken = null;
                state.refreshToken = null;
                state.userData = {
                    id: null, email: null, is_member: null, learn_stage: null,
                    sex: null, ava_url: null,
                };
            })
            .addCase(loadAuthData.pending, (state) => {
                state.isAuthReady = false;
            })
            .addCase(loadAuthData.fulfilled, (state, action) => {
                state.isAuthReady = true;
                if (action.payload) {
                    state.accessToken = action.payload.accessToken;
                    state.refreshToken = action.payload.refreshToken;
                    state.userData = action.payload.user; 
                    state.isAuthenticated = true;
                }
            })
            .addCase(loadAuthData.rejected, (state, action) => {
                state.isAuthReady = true;
                state.isAuthenticated = false;
                state.accessToken = null;
                state.refreshToken = null;
                state.userData = null;
                state.error = action.payload;
            })
            .addCase(fetchUserInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload;
            })
            .addCase(fetchUserInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || '获取用户信息失败';
            })
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userData = action.payload;
                state.error = null;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || '更新失败。';
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;