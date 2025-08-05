import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Dimensions } from 'react-native';
import { CarouselStartData } from "../../assets/CarouselStart/data";
const CarouselStart = ({ onItemPress }) => {
  const width = Dimensions.get('window').width;
  const itemWidth = (width / 2) - 20;
  const itemHeight = (itemWidth / 3) * 4;

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.slide, { height: itemHeight }]} 
        activeOpacity={0.8}
        onPress={() => onItemPress(item.url)}
      >
        <Image source={item.img} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { width: itemWidth }]}>
      <Carousel
        loop
        width={itemWidth}
        height={itemHeight}
        autoPlay={true}
        data={CarouselStartData}
        scrollAnimationDuration={1000}
        renderItem={renderItem}
        autoPlayInterval={3000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginRight: 10,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});


export default CarouselStart;