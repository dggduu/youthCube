import { View, Text } from 'react-native';
import React from 'react';
import MosciaChart from "../../../components/chart/MosciaChart";

const ProgressScreen = ({ route }) => {
  const team_id = 12;

  return (
    <View style={{ flex: 1 }}>
        <View className='p-3 bg-white rounded-xl mx-2 mt-4 justify-center'>
            <MosciaChart team_id={team_id} />
        </View>
    </View>
  );
};

export default ProgressScreen;