import { getItemFromAsyncStorage, setItemToAsyncStorage } from "./LocalStorage";
import { refreshAccessToken } from "./LoginUtil";

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

export function setupSocketIOInterceptor(socket) {
  const originalConnect = socket.connect.bind(socket);
  socket.connect = function (...args) {
    socket.on('connect_error', async (error) => {
      if (error.message.includes('jwt expired') || error.message.includes('invalid token')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              socket.auth.token = token;
              originalConnect();
            })
            .catch((err) => {
              console.error('Failed to refresh token:', err);
            });
        }

        isRefreshing = true;

        try {
          const oldRefreshToken = await getItemFromAsyncStorage("refreshToken");
          const { refreshToken, accessToken } = await refreshAccessToken(oldRefreshToken);

          await setItemToAsyncStorage("accessToken", accessToken);
          await setItemToAsyncStorage("refreshToken", refreshToken);

          socket.auth.token = accessToken;
          processQueue(null, accessToken);
          
          // 重新连接
          originalConnect();
        } catch (err) {
          processQueue(err, null);
          console.error("刷新 token 失败:", err);
        } finally {
          isRefreshing = false;
        }
      }
    });

    originalConnect(...args);
  };

  return socket;
}