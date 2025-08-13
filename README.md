## YouthCube
等待队友进度中  
## ToDo List
### 核心组件
- [x] 导航设计
- [x] 社区平台
- [x]  -  博文查看（评论，点赞，收藏）
- [x]  -  创建博文
- [x]  -  推荐瀑布流（按时间，不做推荐算法）
- [x] 项目平台
- [x]  -  创建项目过程
- [x]  -  团队界面
- [x]  -  项目成果展示
- [x]  -  项目进度管理（CURD），跟踪
- [x]  -  队内私聊
- [x] 网络库封装
- [ ] 联动 AI（适配openai接口）(等待队友中)
- [x] 相机权限query （仅安卓）
- [x] SplashScreen 检查版本更新并使用 DeepLink 跳转 Release 页面
### 非核心组件
- [ ] FCM推送（后台推送）
- [ ] 懒加载策略
- [ ] 请求 react-query 化
- [x] 优化内存占用（react-native-fast-image）
- [ ] 整理一下项目的readme文档
### 目前已知的问题
- [x] 注册时未同步jwt
- [x] 导航器未适配深色模式
- [x] 部分未挂载拦截器
- [ ] 兜底机制
- [x] 没做结题
## Usage
**预构建 release 版的 API Endpoint指向10.0.2.2，意味着需要在 Android Studio 模拟器下运行软件**
### Windows (由于长路径问题，经测试只能编译 Debug 版)
```sh
... 安装Android Studio
https://developer.android.google.cn/studio
... 部署后端与数据库

scoop install nodejs
npm install -g yarn
git clone https://github.com/dggduu/youthCube.git 
cd youthCube
yarn install
yarn android
```