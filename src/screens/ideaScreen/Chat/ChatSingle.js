import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useRoute } from "@react-navigation/native";
import {  } from "react-native-gifted-chat";
import { useToast } from "../../../components/tip/ToastHooks";
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
const ChatSingle = () => {
  const route = useRoute();
  const { chatId } = route.params;
  const { showToast } = useToast();
  useEffect(async()=>{
    const accessToken = await getItemFromAsyncStorage('accessToken');
    const user = await getItemFromAsyncStorage('user');
    if(!user && ! accessToken) {
      showToast("error","错误");
    }
  });
  return (
    <View>
      <Text>ChatGroup</Text>
      <Text>{chatId}</Text>
    </View>
  )
}

export default ChatSingle