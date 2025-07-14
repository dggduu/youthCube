import { View, Text } from 'react-native'
import React, { use, useLayoutEffect } from 'react'
import { useRoute, useNavigation } from "@react-navigation/native";
import PersonChat from "../../../components/aiChat/PersonChat";
const ChatGroup = () => {
  const route = useRoute();
  const { chatId, name } = route.params;
  const navigation = useNavigation();
  useLayoutEffect(()=>{
    navigation.setOptions({
      'title': name
    });
  },[]);
  return (
    <View className='flex-1'>
      <PersonChat chatId={chatId}/>
    </View>
  )
}

export default ChatGroup