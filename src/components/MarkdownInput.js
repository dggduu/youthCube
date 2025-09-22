// components/MarkdownInput.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Modal,
    Text,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useColorScheme } from 'nativewind';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MarkdownInput = ({ value, onChange, placeholder = '进度内容 *' }) => {
    const { colorScheme } = useColorScheme(); // 主题的通信有问题
    const [showModal, setShowModal] = useState(false);
    const webViewRef = useRef(null);

    const injectInitialContentAndTheme = useCallback(() => {
        const script = `
            (function() {
                // 设置主题
                const themeMessage = {
                    type: 'SET_THEME',
                    theme: '${colorScheme === 'dark' ? 'dark' : 'light'}'
                };
                window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(themeMessage));

                // 设置内容
                if (${value ? true : false}) {
                    const contentMessage = {
                        type: 'SET_INITIAL_CONTENT',
                        content: ${JSON.stringify(value)}
                    };
                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(contentMessage));
                }
            })();
        `;
        setTimeout(() => {
            webViewRef.current?.injectJavaScript(script);
        }, 500);
    }, [value, colorScheme]);

    const onMessage = useCallback(
        (event) => {
            try {
                const data = JSON.parse(event.nativeEvent.data);
                switch (data.type) {
                    case 'VDITOR_SUBMIT':
                        onChange(data.content);
                        setShowModal(false);
                        break;
                    case 'VDITOR_READY':
                        injectInitialContentAndTheme();
                        break;
                    case 'VDITOR_CLEARED':
                        onChange('');
                        break;
                    default:
                        break;
                }
            } catch (e) {
                console.error('Failed to parse message from WebView:', e);
            }
        },
        [onChange, injectInitialContentAndTheme]
    );

    const handleClearVditorContent = () => {
        if (webViewRef.current) {
            const script = `
                if (window.confirm("确定要清空所有内容吗？")) {
                    vditorInstance.setValue('');
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VDITOR_CLEARED' }));
                }
            `;
            webViewRef.current.injectJavaScript(script);
        }
    };
    
    return (
        <>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={5}
                className="border border-gray-300 dark:border-gray-600 p-3 h-40 mb-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />

            <TouchableOpacity
                className="bg-[#409eff] py-4 px-4 rounded-lg mb-3 flex-row items-center justify-center"
                onPress={() => setShowModal(true)}
            >
                <MaterialIcons name="edit" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">使用 Markdown 编辑器</Text>
            </TouchableOpacity>

            <Text className="text-sm text-gray-600 dark:text-gray-200 mb-5">
                - 支持 Markdown 语法
            </Text>

            <Modal
                visible={showModal}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
                presentationStyle="fullScreen"
            >
                <View style={{ flex: 1 }}>
                    <View className="flex-row items-center justify-between bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <MaterialIcons name="close" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        </TouchableOpacity>
                        <Text className="text-lg font-semibold text-gray-800 dark:text-white">Markdown 编辑器</Text>
                        <TouchableOpacity onPress={handleClearVditorContent}>
                            <MaterialIcons name="delete-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                        </TouchableOpacity>
                    </View>
                    <WebView
                        ref={webViewRef}
                        source={{ uri: 'file:///android_asset/web/vditor.html' }}
                        style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f8f8f8' }}
                        originWhitelist={['*']}
                        javaScriptEnabled
                        domStorageEnabled
                        allowFileAccess
                        scalesPageToFit={false}
                        onMessage={onMessage}
                        onLoadEnd={injectInitialContentAndTheme}
                        startInLoadingState
                        renderLoading={() => (
                            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
                                <ActivityIndicator size="large" color="#007AFF" />
                            </View>
                        )}
                    />
                </View>
            </Modal>
        </>
    );
};

export default MarkdownInput;