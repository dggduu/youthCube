import { View, Text,SafeAreaView } from 'react-native'
import React from 'react'

const helpScreen = () => {
  return (
    <SafeAreaView className='mt-40 justify-center self-center'>
        <Text className='font-bold text-3xl'>
            问AI，别问我
        </Text>
    </SafeAreaView>
  )
}

export default helpScreen