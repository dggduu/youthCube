const ENV = {
  // 开发环境
  development: {
    BASE_URL: 'http://10.69.57.141:3000/api/auth',
    DEFAULT_AVATAR: 'https://example.com/default-avatar.png',
  },
  production: {
    BASE_URL: 'https://idk/api/auth',
    DEFAULT_AVATAR: 'https://idk/default-avatar.png',
  }
};

const ENV_MODE = 'development';

export default {
  ...ENV[ENV_MODE],
};