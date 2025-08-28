import { View, Text, ScrollView,useColorScheme } from 'react-native';
import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "../../../../components/backIcon/backIcon";
import {UserPolicy} from "../../../../assets/agreement/Policy";

const QualityShowScreen = () => {
  const { colorScheme } = useColorScheme();
  const lines = UserPolicy.split('\n');
  const title = lines[0]; 
  const date = lines.slice(1, 3).join('\n'); 
  const Content = lines.slice(3).join('\n'); 
  const textColor = colorScheme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <BackIcon /> 

      <ScrollView className="flex-1 px-5 pt-2 pb-16">
        <Text className={`text-base leading-6 text-center font-bold ${textColor}`}>
          {title}
        </Text>

        <Text className={`text-base leading-6 text-center font-bold ${textColor}`}>
          {date}
        </Text>

        <Text className={`text-base leading-6 ${textColor}`}>
          {Content}
        </Text>
      </ScrollView>
    </View>
  );
};

export default QualityShowScreen;