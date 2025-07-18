import { View, Text } from 'react-native'
import React from 'react'
import CollectPostFeed from "@components/feedElem/CollectPostFeed";
import backIcon from "../../../../components/backIcon/backIcon";
import BackIcon from '../../../../components/backIcon/backIcon';
const CollectScreen = () => {
  return (
    <View className='flex-1 bg-gray-50 dark:bg-gray-900'>
      <CollectPostFeed/>
    </View>
  )
}

export default CollectScreen