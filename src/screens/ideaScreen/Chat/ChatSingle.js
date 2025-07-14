import { View, Text } from 'react-native'
import React, { useLayoutEffect } from 'react'
import { useRoute,useNavigation } from "@react-navigation/native";
import { GiftedChatContext } from "react-native-gifted-chat";
import PersonChat from "../../../components/aiChat/PersonChat";
const ChatSingle = () => {
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

export default ChatSingle