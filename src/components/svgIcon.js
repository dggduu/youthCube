import React from 'react';
import { View, useColorScheme } from 'react-native';
import { Text } from 'nativewind';

const SVGIcon = ({ source: SvgComponent, width = 32, height = 32, color }) => {
  const colorScheme = useColorScheme();
  const defaultColor = color || (colorScheme === 'dark' ? '#FFFFFF' : '#000000');

  return (
    <View className="items-center justify-center">
      <SvgComponent width={width} height={height} fill={defaultColor} />
    </View>
  );
};

export default SVGIcon;