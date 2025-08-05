import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderBackButton } from "@react-navigation/elements";

import safeDeclare from "../../screens/helperScreen/safeDeclare";
const Stack = createNativeStackNavigator();

import CreateTeam from "../../screens/ideaScreen/Team/CreateTeam";
import HelpChat from "../../components/aiChat/HelpChat";
import InviteToTeam from "../../screens/ideaScreen/Team/InviteToTeam";
import UploadProgress from "../../screens/ideaScreen/Team/UploadProgress";
import UploadEmaple from "../../screens/ideaScreen/Team/UploadEmaple";
import SelectEample from "../../screens/ideaScreen/Team/SelectEample";


import Icon from "@react-native-vector-icons/material-icons";
import { TouchableOpacity } from "react-native";
import { navigate } from "../NavigatorRef";
const CreateTeamNavigtor = () => {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen
        name="Create"
        component={CreateTeam}
        options={({ navigation }) => ({
          headerShown: true,
          title: '创建队伍',
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
        name="Safe"
        component={safeDeclare}
        options={()=> ({
          headerShown: true,
          title: '安全须知',
          headerBackTitle: '返回',
          })}
      />
      <Stack.Screen
        name="AI"
        component={HelpChat}
        options={()=> ({
          headerShown: true,
          title: '问聪宝',
          headerBackTitle: '返回',
          })}
      />
      <Stack.Screen
        name="SelctExample"
        component={SelectEample}
        options={()=> ({
          headerShown: true,
          title: '选择项目模板',
          headerBackTitle: '返回',
          })}
      />
      <Stack.Screen
        name="UploadExmaple"
        component={UploadEmaple}
        options={()=> ({
          headerShown: true,
          title: '从模板创建',
          headerBackTitle: '返回',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
               navigate('MainTabNavigator', { screen: '想法市场'});
              }}
              style={{ marginRight: 10 }}
            >
              <Icon name="save" size={26} color="#007AFF" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Invite"
        component={InviteToTeam}
        options={()=> ({
          headerShown: true,
          title: '邀请入队',
          headerBackTitle: '返回',
          })}
      />
     <Stack.Screen
        name="Upload"
        component={UploadProgress}
        options={({ navigation }) => ({
          headerShown: true,
          title: "创建初期目标",
          headerBackTitle: "返回",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
               navigate('MainTabNavigator', { screen: '想法市场'});
              }}
              style={{ marginRight: 10 }}
            >
              <Icon name="save" size={26} color="#007AFF" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default CreateTeamNavigtor;

