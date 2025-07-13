import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatSection from "../../screens/ideaScreen/Chat/ChatSection";
import ChatGroup from "../../screens/ideaScreen/Chat/ChatGroup";
import ChatGroupSetting from "../../screens/ideaScreen/Chat/ChatGroupSetting";
import ChatSingle from "../../screens/ideaScreen/Chat/ChatSingle";
import HelpChat from "../../components/aiChat/HelpChat";
import HelpScreen from "../../screens/helperScreen/helpScreen";
const Stack = createNativeStackNavigator();

const ChatNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen
        name="section"
        component={ChatSection}
        options={{
          headerShown: true,
          title: '选择聊天',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="single"
        component={ChatSingle}
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="setting"
        component={ChatGroup}
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="group"
        component={ChatGroup}
        options={{
          headerShown: true,
          title: '团队详情',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="help"
        component={HelpScreen}
        options={{
          headerShown: true,
          title: '',
          headerBackTitle: '返回'
        }}
      />
    </Stack.Navigator>
  );
};

export default ChatNavigator;