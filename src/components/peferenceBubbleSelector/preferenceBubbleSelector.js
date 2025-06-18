import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const PreferenceBubbleSelector = ({ options, onSubmit }) => {
  const [selected, setSelected] = useState([]);
  const maxSelection = 5;

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
        style={styles.bubbleContainer}
        onPress={() => toggleSelection(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={
            isSelected
              ? ['#4A90E2', '#5B6CFF']
              : ['#e0e0e0', '#f5f5f5']
          }
          style={styles.bubble}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.bubbleText, isSelected && styles.selectedText]}>
            {item}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={options}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => onSubmit(selected)}
      >
        <Text style={styles.submitText}>提交</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PreferenceBubbleSelector;