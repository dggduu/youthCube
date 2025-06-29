const ENV = {
  // 开发环境
  development: {
    BASE_URL: 'http://192.168.0.102:3000/api/auth',
    DEFAULT_AVATAR: 'https://example.com/default-avatar.png',
    AI_CHAT_BASE_URL: 'http://192.168.0.102:1234',
    DEV: true,
  },
  production: {
    BASE_URL: 'https://idk/api/auth',
    DEFAULT_AVATAR: 'https://idk/default-avatar.png',
    AI_CHAT_BASE_URL: 'http://idk.com',
    DEV: false,
  }
};

const ENV_MODE = 'development';

export default {
  ...ENV[ENV_MODE],
};