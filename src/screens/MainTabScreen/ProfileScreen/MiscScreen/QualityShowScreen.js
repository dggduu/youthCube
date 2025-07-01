import { View, Text, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "../../../../components/backIcon/backIcon";
const QualityShowScreen = () => {
  return (
    <SafeAreaView className='flex-1'>
      <BackIcon isDark={false}/>
      <View className='self-center mt-10'>
        <Text className='self-center font-medium text-xl mb-7'>营业执照</Text>
        <Image source={require("../../../../assets/tmp.png")}/>
      </View>
    </SafeAreaView>
  )
}

export default QualityShowScreen