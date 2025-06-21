import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BackIcon = ({ isDark = false }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
    onPress={() => navigation.goBack()}
    className={`mt-16 ml-4 flex items-center justify-center rounded-full ${isDark ? "bg-gray-800" : 'bg-gray-300'} w-16 h-12`}
    >
    <MaterialIcons
        name="arrow-back"
        size={24}
        color={isDark ? '#aaa' : '#000'}
    />
    </TouchableOpacity>
  );
};

export default BackIcon;