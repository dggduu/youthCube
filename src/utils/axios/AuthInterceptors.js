import axios from "axios";
import { refreshAccessToken } from "../LoginUtil";
import {
  getItemFromAsyncStorage,
  setItemToAsyncStorage,
} from "../LocalStorage";

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

export default function setupAuthInterceptors(instance) {
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const { config: originalRequest, response } = error;

      if (response && response.status === 403) {
        if (originalRequest._retry) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return instance(originalRequest);
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

          const retryResponse = await instance(originalRequest);

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
}