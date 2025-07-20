import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import AddProgress from "../../screens/ideaScreen/Progress/AddProgress";
import ProgessComment from "../../screens/ideaScreen/Progress/ProgessComment";
import ProgressAdmin from "../../screens/ideaScreen/Progress/ProgressAdmin";
import ProgressScreen from "../../screens/ideaScreen/Progress/ProgressScreen";
import { HeaderBackButton } from "@react-navigation/elements";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";

import ProgressCreateNavigator from "./ProgressCreateNavigtor";

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
       options={({ navigation }) => ({
          headerShown: true,
          title: '进度管理',
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