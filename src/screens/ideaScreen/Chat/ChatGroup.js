import { View, Text } from 'react-native'
import React from 'react'
import { useRoute } from "@react-navigation/native";
import { GiftedChatContext } from "react-native-gifted-chat";
const ChatGroup = () => {
  const route = useRoute();
  const { chatId } = route.params;
  return (
    <View>
      <Text>ChatGroup</Text>
      <Text>{chatId}</Text>
    </View>
  )
}

export default ChatGroup