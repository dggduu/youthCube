import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostDetailScreen from "../../screens/IdeaMarketScreen/PostDetailScreen";
import IdeaMarketScreen from "../../screens/MainTabScreen/ideaMarketScreen";
import TagSection from "../../screens/IdeaMarketScreen/TagSection";
import { Tag } from "@ant-design/react-native";
const Stack = createNativeStackNavigator();

const PostNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="IdeaMarket" component={IdeaMarketScreen} />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{
          headerShown: true,
          title: '帖子详情',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen 
        name="Tag" 
        component={TagSection}
        options={{
          headerShown: true,
          title: '根据 Tag 查询文章',
          headerBackTitle: '返回'
        }}
      />
    </Stack.Navigator>
  );
};

export default PostNavigator;