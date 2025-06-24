import React from 'react';
import { Text, View} from 'react-native';
import MainChat from "../../components/aiChat/mainChat";

import { SafeAreaProvider} from 'react-native-safe-area-context';

const ChatScreen = () => {
  return (
    <SafeAreaProvider>
      <MainChat/>
    </SafeAreaProvider>
  );
};

export default ChatScreen;