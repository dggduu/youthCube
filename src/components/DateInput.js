// components/DateInput.js
import React, { useState } from 'react';
import { View, Text, Picker } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'react-native';
import tw from 'nativewind';

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

const TwView = tw(View);
const TwText = tw(Text);

export default function DateInput({
  label,
  value,
  onChange,
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [day, setDay] = useState(value?.day || days[0]);
  const [month, setMonth] = useState(value?.month || months[0]);
  const [year, setYear] = useState(value?.year || years[0]);

  const handleDateChange = (type, val) => {
    const newValue = { day, month, year, [type]: val };
    onChange(newValue);
  };

  return (
    <View className="mb-5">
      {label && (
        <Text
        className={`${
          isDark ? 'text-gray-300' : 'text-gray-700'
        } mb-3 font-normal`}
      >
        {label}
      </Text>
      )}

      <TwView className={`flex-row justify-between rounded-md px-3 py-2 ${
        isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
      } border`}>
        <Picker
          selectedValue={day}
          onValueChange={(val) => handleDateChange('day', val)}
          style={{ flex: 1 }}
          itemStyle={{
            color: isDark ? '#E5E5E5' : '#111',
          }}
        >
          {days.map((d) => (
            <Picker.Item key={`day-${d}`} label={`${d}日`} value={d} />
          ))}
        </Picker>

        <Picker
          selectedValue={month}
          onValueChange={(val) => handleDateChange('month', val)}
          style={{ flex: 1 }}
          itemStyle={{
            color: isDark ? '#E5E5E5' : '#111',
          }}
        >
          {months.map((m) => (
            <Picker.Item key={`month-${m}`} label={`${m}月`} value={m} />
          ))}
        </Picker>

        <Picker
          selectedValue={year}
          onValueChange={(val) => handleDateChange('year', val)}
          style={{ flex: 1 }}
          itemStyle={{
            color: isDark ? '#E5E5E5' : '#111',
          }}
        >
          {years.map((y) => (
            <Picker.Item key={`year-${y}`} label={`${y}年`} value={y} />
          ))}
        </Picker>
      </TwView>
    </View>
  );
}