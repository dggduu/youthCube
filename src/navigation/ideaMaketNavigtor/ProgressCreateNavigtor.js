
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AddProgress from "../../screens/ideaScreen/Progress/AddProgress";
import AddEndProgress from "../../screens/ideaScreen/Progress/AddEndProgress";

const Tab = createMaterialTopTabNavigator();
const ProgressCreateNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Add" 
        component={AddProgress}
      />
      <Tab.Screen 
        name="AddEnd" 
        component={AddEndProgress}
      />
    </Tab.Navigator>
  );
};

export default ProgressCreateNavigator;