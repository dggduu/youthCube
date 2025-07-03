import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostDetailScreen from "../../screens/IdeaMarketScreen/PostDetailScreen";
import IdeaMarketScreen from "../../screens/MainTabScreen/ideaMarketScreen";

const Stack = createNativeStackNavigator();

const PostNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right' // 可选：添加页面切换动画
      }}
    >
      {/* 将列表页设为默认首页 */}
      <Stack.Screen name="IdeaMarket" component={IdeaMarketScreen} />
      {/* 详情页配置 */}
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{
          headerShown: true, // 详情页显示头部
          title: '帖子详情', // 默认标题
          headerBackTitle: '返回' // iOS返回按钮文字
        }}
      />
    </Stack.Navigator>
  );
};

export default PostNavigator;