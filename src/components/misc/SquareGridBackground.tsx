import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Rect, Pattern } from 'react-native-svg';

type SquareGridBackgroundProps = {
  pattern?: React.FC<any>;
  color?: string;
  size?: number;
};

const SquareGridBackground: React.FC<SquareGridBackgroundProps> = ({
  pattern: PatternComponent,
  color = '#000',
  size = 70,
}) => {
  const { width, height } = useWindowDimensions(); // 自动适配屏幕变化

  if (!PatternComponent) return null;

  return (
    <View style={styles.background}>
      <Svg
        height={height} 
        width={width}
        style={StyleSheet.absoluteFillObject}
      >
        <Pattern
          id="grid"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <PatternComponent width={size} height={size} fill={color} />
        </Pattern>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </View>
  );
};

export default SquareGridBackground;

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});