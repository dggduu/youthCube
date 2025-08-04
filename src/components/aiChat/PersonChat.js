import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  useColorScheme
} from 'react-native';
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar
} from 'react-native-gifted-chat';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useRoute,useNavigation } from '@react-navigation/native';
import { useToast } from '../../components/tip/ToastHooks';
import {
  getItemFromAsyncStorage,
  setItemToAsyncStorage,
} from '../../utils/LocalStorage';
import { BASE_INFO } from '../../constant/base';
import axios from 'axios';
import io from 'socket.io-client';
import { refreshAccessToken } from "../../utils/LoginUtil";

import SquareGridBackground from "../misc/SquareGridBackground";
import PatternSVG from "../../assets/background/pattern.svg";
import { setupSocketIOInterceptor } from "../../utils/SocketIOInterceptor";
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const PersonChat = ( {chatId} ) => {
  const { showToast } = useToast();
    const colorScheme = useColorScheme();
    const isDarkMode =colorScheme === 'dark';
  const [messages, setMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // 加载历史消息
  const loadHistoryMessages = useCallback(
    async (pageNum = 0) => {
      if (!accessToken || !chatId) return;

      try {
        setIsChatLoading(true);
        const response = await api.get(`${BASE_INFO.BASE_URL}api/chatrooms/history/${chatId}`, {
          params: { page: pageNum, size: 20 },
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const { items, totalItems } = response.data;

        const formattedMessages = items.map((item) => ({
          _id: item.message_id,
          text: item.content,
          createdAt: new Date(item.timestamp),
          user: {
            _id: item.sender_id,
            name: item.sender?.name || '未知用户',
            avatar: item.sender?.avatar || '',
          },
        }));

        if (pageNum === 0) {
          setMessages(formattedMessages);
          await setItemToAsyncStorage(`chat_${chatId}_messages`, formattedMessages);
        } else {
          setMessages((prev) => [...prev, ...formattedMessages]);
          const cached = (await getItemFromAsyncStorage(`chat_${chatId}_messages`)) || [];
          await setItemToAsyncStorage(`chat_${chatId}_messages`, [...cached, ...formattedMessages]);
        }

        setPage(pageNum);
        setHasMoreMessages(pageNum < Math.ceil(totalItems / 20) - 1);
      } catch (error) {
        console.error('加载历史消息失败:', error);
        showToast('加载消息失败', 'error');
      } finally {
        setIsChatLoading(false);
      }
    },
    [accessToken, chatId]
  );

  // 接收新消息
  const handleNewMessage = useCallback(
    (message) => {
      const formattedMessage = {
        _id: message.message_id,
        text: message.content,
        createdAt: new Date(message.timestamp),
        user: {
          _id: message.sender_id,
          name: message.sender?.name || '未知用户',
          avatar: message.sender?.avatar || '',
        },
      };

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isLocal);
        return GiftedChat.append(filtered, [formattedMessage]);
      });
    },
    []
  );

  // 处理敏感词错误
  const handleMessageError = useCallback((errorData) => {
    const { forbiddenWords, firstWord } = errorData;

    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg.isLocal) {
          return {
            ...msg,
            hasSensitiveWords: true,
            sensitiveWords: forbiddenWords,
            warningMessage: `包含敏感词：“${firstWord}”`,
          };
        }
        return msg;
      });
    });
  }, []);

  // 发送消息
  const onSend = useCallback(
    (newMessages = []) => {
      if (!socket || newMessages.length === 0) return;

      const message = newMessages[0];

      const localMessage = {
        ...message,
        _id: `local-${Date.now()}`,
        isLocal: true,
      };

      setMessages((prev) => GiftedChat.append(prev, [localMessage]));

      socket.emit('send:message', {
        content: message.text,
        room_id: String(chatId),
      });
    },
    [socket, chatId]
  );

  // 加载更多消息
  const loadEarlierMessages = useCallback(() => {
    if (isChatLoading || !hasMoreMessages) return;
    loadHistoryMessages(page + 1);
  }, [isChatLoading, hasMoreMessages, page, loadHistoryMessages]);

  // 初始化 Socket
  useEffect(() => {
    if (!user || !accessToken || !chatId) return;

    const newSocket = io(BASE_INFO.BASE_SOCKET_URL, {
      auth: {
        token: accessToken,
        room_id: String(chatId),
      },
      transports: ['websocket'],
      reconnectionAttempts: Infinity,
    });
    // 认证失败拦截器
    setupSocketIOInterceptor(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Socket 已连接');
    });

    newSocket.on('disconnect', (reason) => {
        console.log('Socket 断开连接:', reason);
        if (reason === 'io server disconnect') {
          newSocket.connect(); // 主动重连
        }
      });

    newSocket.on('receive:message', handleNewMessage);
    newSocket.on('message:error', handleMessageError);

    setSocket(newSocket);

    return () => {
      newSocket.off('receive:message', handleNewMessage);
      newSocket.off('message:error', handleMessageError);
      newSocket.disconnect();
    };
  }, [user, accessToken, chatId, handleNewMessage, handleMessageError]);

  // 初始化用户信息
  useEffect(() => {
    const init = async () => {
      const [token, userData] = await Promise.all([
        getItemFromAsyncStorage('accessToken'),
        getItemFromAsyncStorage('user'),
      ]);

      if (!userData || !token) {
        showToast('请先登录', 'error');
        return;
      }

      setAccessToken(token);
      setUser(userData);
    };

    init();
  }, []);

  const renderInputToolbar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: isDarkMode ? "#12140e" : "#f9faef",
          paddingTop: 4,
          paddingBottom: 2,
        }}
      />
    );
  };

  // 页面进入时加载消息
  useEffect(() => {
    if (user && accessToken && chatId) {
      loadHistoryMessages(0);
    }
  }, [user, accessToken, chatId]);

  // 自定义气泡样式(敏感词警告)
  const renderBubble = (props) => {
    const isSensitive = props.currentMessage.hasSensitiveWords;

    return (
      <View style={styles.bubbleContainer}>
        <Bubble
          {...props}
          wrapperStyle={{
            left: { // AI消息气泡样式
              backgroundColor: isDarkMode ? '#313131' : '#f0f0f0',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
              paddingLeft: 5,
              paddingRight: 5,
              paddingTop: 5,
              marginBottom: 10,
            },
            right: { // 发送者消息气泡样式
              backgroundColor: isDarkMode ? '#313131' : '#f0f0f0',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              paddingLeft: 5,
              paddingRight: 5,
              paddingTop: 5,
              marginBottom: 10,
            },
          }}
          textStyle={{
            left: {
              color: isDarkMode ? '#fff' : '#000',
            },
            right: {
              color: isDarkMode ? '#fff' : '#000',
            },
          }}
         timeTextStyle={{
            left: {
              color: isDarkMode ? '#ccc' : '#666',
            },
            right: {
              color: isDarkMode ? '#ccc' : '#666',
            },
          }}
        />
        {isSensitive && (
          <TouchableOpacity
            style={styles.warningIcon}
            onPress={() =>
              Alert.alert('敏感词提示', `检测到敏感词：${props.currentMessage.sensitiveWords.join(', ')}`)
            }
          >
            <Text className='text-white dark:text-gray-300'>!</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // 自定义发送按钮
  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <MaterialIcon name="send" size={15} color="#fff" />
      </View>
    </Send>
  );

    return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? "#141414" : "#fff" }}>
            <GiftedChat
                messages={messages}
                onSend={onSend}
                user={{
                _id: user?.id || 0,
                name: user?.name || '',
                avatar:'',
                }}
                placeholder="输入消息..."
                renderUsernameOnMessage
                isKeyboardInternallyDisabled={isChatLoading}
                renderBubble={renderBubble}
                renderSend={renderSend}
                onLoadEarlier={loadEarlierMessages}
                isLoadingEarlier={isChatLoading}
                loadEarlier={hasMoreMessages}
                infiniteScroll
                renderInputToolbar={renderInputToolbar}
                bottomOffset={Platform.OS === 'ios' ? 34 : 0}
                keyboardShouldPersistTaps="handled"
                textInputProps={{
                maxLength: 200,
                }}
                textInputStyle={{
                  color: isDarkMode ? '#fff' : '#000',
                  fontSize: 16,
                  padding: 10,
                  maxHeight: 100,
                  minHeight: 40,
                  flex: 1,
                  backgroundColor: isDarkMode ? "#141414" : "#fefefe",
                  borderRadius: 20,
                  paddingHorizontal: 15,
                }}
                listViewProps={{
                style: { backgroundColor: 'transparent' },
                }}
            />
            {isChatLoading && (
                <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#477572" />
                </View>
            )}
    </View>
    );
};

// 样式定义
const styles = StyleSheet.create({
  bubbleContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  warningIcon: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ba1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  sendButton: {
    marginRight: 8,
    marginLeft: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#477572',
    borderRadius: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});

export default PersonChat;