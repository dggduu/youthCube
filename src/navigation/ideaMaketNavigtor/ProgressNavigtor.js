import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AddProgress from "../../screens/ideaScreen/Progress/AddProgress";
import ProgessComment from "../../screens/ideaScreen/Progress/ProgessComment";
import ProgressAdmin from "../../screens/ideaScreen/Progress/ProgressAdmin";
import ProgressScreen from "../../screens/ideaScreen/Progress/ProgressScreen";

const Stack = createNativeStackNavigator();

const ProgressNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen 
        name="TimeLine" 
        component={ProgressScreen}
        options={{
          headerShown: true,
          title: '时间线',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen 
        name="Add" 
        component={AddProgress}
        options={{
          headerShown: true,
          title: '添加进度',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="Admin"
        component={ProgressAdmin}
        options={{
          headerShown: true,
          title: '进度管理',
          headerBackTitle: '返回'
        }}  
      />
      <Stack.Screen
        name="Comment"
        component={ProgessComment}
        options={{
          headerShown: true,
          title: '评论',
          headerBackTitle: '返回'
        }}  
      />
    </Stack.Navigator>
  );
};

export default ProgressNavigator;