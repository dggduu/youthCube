import { View, Text } from 'react-native'
import React from 'react'
import PostFeed from "../../components/feedElem/postFeed";

export default function IeaMarketScreen() {
  return (
    <View className='flex-1'>
      <PostFeed/>
    </View>
  )
}