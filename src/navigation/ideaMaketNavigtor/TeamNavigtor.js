import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ideaMarketScreen from "../../screens/MainTabScreen/ideaMarketScreen";
import TeamDetailScreen from "../../screens/ideaScreen/TeamDetailScreen";
import TagSection from "../../screens/ideaScreen/TagSection";
import ChatNavigtor from "./ChatNavigtor";
import PersonalProfile from "../../components/PresonalProfile";
import PostNavigator from "./PostNavigtor";
import ProgressNavigtor from "./ProgressNavigtor";

const Stack = createNativeStackNavigator();

const TeamNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="IdeaMarket" component={ideaMarketScreen} />
      <Stack.Screen name="Post" component={PostNavigator} />
      <Stack.Screen name="Chat" component={ChatNavigtor} />
      <Stack.Screen name="Progress" component={ProgressNavigtor} />
      <Stack.Screen 
        name="TeamDetail" 
        component={TeamDetailScreen}
        options={{
          headerShown: true,
          title: '团队详情',
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
      <Stack.Screen
        name="profile"
        component={PersonalProfile}
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: '返回'
        }}  
      />
    </Stack.Navigator>
  );
};

export default TeamNavigator;