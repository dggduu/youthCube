import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CollectScreen from "../../screens/MainTabScreen/ProfileScreen/LearningScreen/CollectScreen";
import PostDetailScreen from "../../screens/learningScreen/PostDetailScreen";
import TagSection from "../../screens/learningScreen/TagSection";
import { HeaderBackButton } from "@react-navigation/elements";
const Stack = createNativeStackNavigator();

const CollectNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen
        name="IdeaMarket"
        component={CollectScreen}
        options={({ navigation }) => ({
          headerShown: true,
          title: '我的收藏',
          headerBackTitle: '返回',
          headerLeft: (props) => (
            <HeaderBackButton
              {...props}
              onPress={() => {
                navigation.goBack();
              }}
            />
          ),
        })}
      />
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

export default CollectNavigator;