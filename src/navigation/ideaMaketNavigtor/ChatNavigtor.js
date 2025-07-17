import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatSection from "../../screens/ideaScreen/Chat/ChatSection";
import ChatGroup from "../../screens/ideaScreen/Chat/ChatGroup";
import ChatGroupSetting from "../../screens/ideaScreen/Chat/ChatGroupSetting";
import ChatSingle from "../../screens/ideaScreen/Chat/ChatSingle";
import HelpChat from "../../components/aiChat/HelpChat";
import HelpScreen from "../../screens/helperScreen/helpScreen";
import InviteFriend from "../../screens/ideaScreen/Chat/InviteFriend";
import InviteRedux from "../../screens/ideaScreen/Chat/InviteRedux";

import { TouchableOpacity } from "react-native";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { HeaderBackButton } from "@react-navigation/elements";
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
        options={({ navigation }) => ({
          headerShown: true,
          title: '选择聊天',
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
        name="single"
        component={ChatSingle}
        options={{
          headerShown: true,
          title: '私聊',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="setting"
        component={ChatGroupSetting}
        options={{
          headerShown: true,
          title: '群聊设置',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="group"
        component={ChatGroup}
        options={({ navigation, route }) => {
          const { team_id } = route.params || {};

          return {
            headerShown: true,
            title: '队内聊天',
            headerBackTitle: '返回',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('setting', { team_id });
                }}
                style={{ marginRight: 10 }}
              >
                <MaterialIcon name="density-medium" size={24} color="#333" />
              </TouchableOpacity>
            ),
          };
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
      <Stack.Screen 
        name="Invite"
        component={InviteFriend}
        options={{
          headerShown: true,
          title: '邀请好友',
          headerBackTitle: '返回'
        }}
      />
      <Stack.Screen
        name="InviteRedux"
        component={InviteRedux}
        options={{
          headerShown: true,
          title: '入群申请管理',
          headerBackTitle: '返回'
        }}
      />
    </Stack.Navigator>
  );
};

export default ChatNavigator;

