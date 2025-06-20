import React from 'react';
import { View, Text, Picker } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function PickerInput({
  label,
  placeholder,
  selectedValue,
  onValueChange,
  items,
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="mb-5">
      {label && (
        <Text
          className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 font-normal`}
        >
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-md px-3 py-2 ${
          isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        } border`}
      >
        <MaterialIcon
          name="arrow-drop-down"
          size={20}
          color={isDark ? '#A9A9A9' : '#888'}
          style={{ marginRight: 10 }}
        />

        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={{ flex: 1 }}
          itemStyle={{ color: isDark ? '#E5E5E5' : '#111' }}
        >
          <Picker.Item label={placeholder} value="" color="#999" />
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}