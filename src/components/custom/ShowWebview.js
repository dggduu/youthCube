import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';

const ShowWebview = ({ route }) => {
  const { url } = route.params;

  console.log('WebView URL:', url);

  if (!url) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>无效的链接：缺少 URL 参数</Text>
      </View>
    );
  }

  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: normalizedUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}></Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView 加载失败:', nativeEvent);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        useWebKit={true}
        scalesPageToFit={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}

        onShouldStartLoadWithRequest={(request) => {
          return true;
        }}
      />
    </View>
  );
};

export default ShowWebview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
});