import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getAccessTokenByLogin,
    refreshAccessToken
} from '../../utils/LoginUtil';
import {
    setItemToAsyncStorage,
    removeItemFromAsyncStorage,
    getItemFromAsyncStorage
} from '../../utils/LocalStorage';

import { BASE_INFO } from "../../constant/base";
import BackIcon from '../../components/backIcon/backIcon';
// Thunks
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
            // 将用户信息存入localStorage
            await setItemToAsyncStorage('user', userData);
            
            return userData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 异步登录操作
export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ email, pswd }, { rejectWithValue }) => {
        try {
            const response = await getAccessTokenByLogin({ email, pswd });
            // 登录成功后，将 tokens 和用户数据存储到 AsyncStorage
            await setItemToAsyncStorage('accessToken', response.accessToken);
            await setItemToAsyncStorage('refreshToken', response.refreshToken);
            return response;
        } catch (error) {
            const errorMessage = error.message || '登录失败，请检查网络或凭据。';
            return rejectWithValue(errorMessage);
        }
    }
);

// 刷新 token 
export const refreshAuthToken = createAsyncThunk(
    'auth/refreshAuthToken',
    async (_, { getState, rejectWithValue }) => {
        const { auth } = getState(); // 从 Redux 获取当前认证状态
        const currentRefreshToken = auth.refreshToken || (await getItemFromAsyncStorage('refreshToken'));

        if (!currentRefreshToken) {
            return rejectWithValue('没有刷新令牌，请重新登录。');
        }

        try {
            const newAccessToken = await refreshAccessToken(currentRefreshToken);
            // 刷新成功后，更新 accessToken
            await setItemToAsyncStorage('accessToken', newAccessToken);
            return newAccessToken;
        } catch (error) {
            const errorMessage = error.message || '刷新令牌失败，请重新登录。';
            // 如果刷新失败，清除所有认证信息
            await removeItemFromAsyncStorage('accessToken');
            await removeItemFromAsyncStorage('refreshToken');
            await removeItemFromAsyncStorage('user');
            return rejectWithValue(errorMessage);
        }
    }
);

// 加载认证数据（应用启动时）
export const loadAuthData = createAsyncThunk(
    'auth/loadData',
    async (_, { rejectWithValue }) => {
        try {
            if (BASE_INFO.magic.isSkipLoginPage) { // 假用户
                const fakeAccessToken = "the_pursuit_of_happyness";
                const fakeRefreshToken = "come_on_baby_light_my_fire";
                await setItemToAsyncStorage('accessToken', fakeAccessToken);
                await setItemToAsyncStorage('refreshToken', fakeRefreshToken);
                await setItemToAsyncStorage('user', BASE_INFO.fakeUser);
                return {
                    accessToken: fakeAccessToken,
                    refreshToken: fakeRefreshToken,
                    user: BASE_INFO.fakeUser,
                };
            }
            const accessToken = await getItemFromAsyncStorage('accessToken');
            const refreshToken = await getItemFromAsyncStorage('refreshToken');
            const user = await getItemFromAsyncStorage('user');

            if (accessToken && refreshToken && user) {
                // 返回完整的用户数据对象
                return { accessToken, refreshToken, user };
            }
            return null;
        } catch (error) {
            console.error('从 AsyncStorage 加载认证数据失败:', error);
            // 清理可能损坏的存储数据
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
        // 同步登出 action
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
            // loginUser 的生命周期
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                // 将完整的 user 对象保存到 userData
                state.userData = action.payload.user; 
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || '登录失败';
                state.isAuthenticated = false;
                state.accessToken = null;
                state.refreshToken = null;
                // 登录失败时，清除 userData
                state.userData = {
                    id: null, email: null, is_member: null, learn_stage: null,
                    sex: null, ava_url: null,
                };
            })
            // refreshAuthToken 的生命周期
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
            .addCase(loadAuthData.rejected, (state, action) => {
                state.isAuthReady = true;
                state.error = action.payload || '加载认证数据失败';
                state.isAuthenticated = false;
                state.userData = {
                    id: null, email: null, is_member: null, learn_stage: null,
                    sex: null, ava_url: null,
                };
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;