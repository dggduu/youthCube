import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const FeedElem = ({ imgUrl, title, subtitle, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={styles.card}>
        {imgUrl ? (
          <Image
            source={{ uri: imgUrl }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {title || '暂无标题'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle || '暂无描述'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#f3f4f6',
  },
  placeholder: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default FeedElem;