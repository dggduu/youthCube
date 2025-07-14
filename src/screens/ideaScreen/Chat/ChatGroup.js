import { View, Text } from 'react-native'
import React from 'react'
import { useRoute } from "@react-navigation/native";
import { GiftedChatContext } from "react-native-gifted-chat";
import PersonChat from "../../../components/aiChat/PersonChat";
const ChatGroup = () => {
  const route = useRoute();
  const { chatId } = route.params;
  return (
    <View className='flex-1'>
      <Text>{chatId}</Text>
      <PersonChat chatId={chatId}/>
    </View>
  )
}

export default ChatGroup