import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PreferenceBubbleSelector = ({ options, onSubmit }) => {
  const [selected, setSelected] = useState([]);
  const maxSelection = 5;
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";

  const toggleSelection = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      if (selected.length >= maxSelection) {
        Alert.alert('提示', `最多只能选择 ${maxSelection} 个偏好`);
        return;
      }
      setSelected([...selected, item]);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selected.includes(item);

    return (
      <TouchableOpacity
        className={`flex-1 m-1 py-4 rounded-xl items-center justify-center ${
          isSelected ? 'bg-green-400' : 'bg-gray-300'
        }`}
        onPress={() => toggleSelection(item)}
        activeOpacity={0.7}
      >
        <Text
          className={`text-sm font-medium ${
            isSelected ? 'text-white' : 'text-gray-800'
          }`}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'} px-4`}
    >
      <FlatList
        data={options}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item);
          return (
            <TouchableOpacity
              className={`
                flex-1 m-2 py-4 rounded-xl items-center justify-center
                ${
                  isSelected
                    ? 'bg-green-500'
                    : isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
                }
              `}
              onPress={() => toggleSelection(item)}
            >
              <Text
                className={`
                  text-base font-medium
                  ${
                    isSelected
                      ? 'text-white'
                      : isDark
                      ? 'text-gray-300'
                      : 'text-gray-800'
                  }
                `}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
        numColumns={2}
        contentContainerClassName="py-2"
        columnWrapperClassName="justify-between space-x-4"
      />

      <TouchableOpacity
        className={`
          mt-6 py-4 rounded-lg items-center justify-center
          ${isDark ? 'bg-[#409eff]' : 'bg-[#409eff]'}
        `}
        onPress={() => onSubmit(selected)}
      >
        <Text className="text-white text-lg font-medium">提交</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PreferenceBubbleSelector;