import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react'

const Stack = createNativeStackNavigator();

const FunctionNavigator = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen name=""/>
    </Stack.Navigator>
  )
}

export default FunctionNavigator