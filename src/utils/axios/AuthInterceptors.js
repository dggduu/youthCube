import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { refreshAccessToken } from '../LoginUtil';
import {
  getItemFromAsyncStorage,
  setItemToAsyncStorage,
} from '../LocalStorage';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export default function etupAuthInterceptors(instance, cacheOptions = {}) {

  const cachedInstance = setupCache(instance, {
    ttl: 5 * 60 * 1000,
    ...cacheOptions,
  });

  cachedInstance.interceptors.request.use(
    async (config) => {
      const token = await getItemFromAsyncStorage("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  cachedInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const { config: originalRequest, response } = error;

      if (response && (response.status === 401 || response.status === 403)) {
        if (originalRequest._retry) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return cachedInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
          const oldRefreshToken = await getItemFromAsyncStorage("refreshToken");
          const { refreshToken, accessToken } = await refreshAccessToken(oldRefreshToken);

          await setItemToAsyncStorage("accessToken", accessToken);
          await setItemToAsyncStorage("refreshToken", refreshToken);

          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          originalRequest._retry = true;

          const retryResponse = await cachedInstance(originalRequest);

          processQueue(null, accessToken);

          return retryResponse;
        } catch (err) {
          processQueue(err, null);
          console.error("刷新 token 失败:", err);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
  return cachedInstance;
}