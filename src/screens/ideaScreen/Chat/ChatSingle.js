import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
  Composer,
} from 'react-native-gifted-chat';
import { LinearGradient } from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { useToast } from '../../../components/tip/ToastHooks';
import { getItemFromAsyncStorage, setItemToAsyncStorage, removeItemFromAsyncStorage } from '../../../utils/LocalStorage';
import { BASE_INFO } from '../../../constant/base';
import axios from 'axios';
import io from 'socket.io-client';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const ChatSingle = () => {
  const route = useRoute();
  const { chatId } = route.params;
  const { showToast } = useToast();

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

      const response = await axios.get(`${BASE_INFO.BASE_URL}api/chatrooms/history/${chatId}`, {
        params: {
          page: pageNum,
          size: 20,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
        // 第一次加载
        setMessages(formattedMessages);
        await setItemToAsyncStorage(`chat_${chatId}_messages`, formattedMessages);
      } else {
        // 加载更早数据，拼接到末尾
        setMessages((prev) => [...prev, ...formattedMessages]);

        const cached = await getItemFromAsyncStorage(`chat_${chatId}_messages`) || [];
        await setItemToAsyncStorage(
          `chat_${chatId}_messages`,
          [...cached, ...formattedMessages]
        );
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


  // 处理新消息（来自 socket）
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
        const filtered = prev.filter((m) => !m.isLocal); // 移除所有临时消息
        return GiftedChat.append(filtered, [formattedMessage]); // 添加真实消息
      });

      setItemToAsyncStorage(`chat_${chatId}_messages`, [
        formattedMessage,
        ...messages,
      ]);
    },
    [chatId, messages]
  );

  // 发送消息
  const onSend = useCallback(
    (newMessages = []) => {
      if (!socket || newMessages.length === 0) return;

      const message = newMessages[0];

      const localMessage = {
        ...message,
        _id: `local-${Date.now()}`, // 本地临时ID
        isLocal: true,
      };

      // 先添加本地临时消息
      setMessages((prev) => GiftedChat.append(prev, [localMessage]));

      // 发送消息到服务端
      socket.emit('send:message', {
        content: message.text,
        room_id: chatId,
      });
    },
    [socket, chatId]
  );

  // 加载更多消息
  const loadEarlierMessages = useCallback(() => {
    if (isChatLoading || !hasMoreMessages) return;
    loadHistoryMessages(page + 1);
  }, [isChatLoading, hasMoreMessages, page, loadHistoryMessages]);

  // 初始化Socket连接
  useEffect(() => {
    if (!user || !accessToken || !chatId) return;

    const socketUrl = BASE_INFO.BASE_SOCKET_URL;
    const newSocket = io(socketUrl, {
      auth: {
        token: accessToken,
        room_id: chatId,
      },
      transports: ['websocket'],
      reconnectionAttempts: Infinity,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('receive:message', (message) => {
      console.log('收到新消息:', message);
      handleNewMessage(message);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.off('receive:message');
        newSocket.disconnect();
      }
    };
  }, [user, accessToken, chatId, handleNewMessage]);

  // 初始化用户信息 & Token
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

  // 页面进入时刷新消息
  useEffect(() => {
    if (user && accessToken && chatId) {
      loadHistoryMessages(0);
    }
  }, [user, accessToken, chatId]);

  // 自定义消息气泡
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#e8e9de',
            borderRadius: 10,
            padding: 5,
          },
          right: {
            backgroundColor: '#477572',
            borderRadius: 10,
            padding: 5,
          },
        }}
        textStyle={{
          left: { color: '#000' },
          right: { color: '#fff' },
        }}
      />
    );
  };

  // 自定义发送按钮
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View
          style={{
            marginRight: 8,
            marginLeft: 8,
            marginBottom: 8,
            padding: 8,
            backgroundColor: '#477572',
            borderRadius: 20,
            alignSelf: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcon name="send" size={16} color="#fff" />
        </View>
      </Send>
    );
  };

  return (
    <LinearGradient colors={['#f0f9eb', '#c9e5b5']} style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: user?.id || 0,
          name: user?.name || '',
          avatar: user?.avatar || '',
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
        bottomOffset={Platform.OS === 'ios' ? 34 : 0}
        keyboardShouldPersistTaps="handled"
        textInputProps={{
          maxLength: 200,
        }}
        textInputStyle={{
          color: '#000',
          fontSize: 16,
          maxHeight: 100,
          minHeight: 40,
          flex: 1,
          backgroundColor: '#f9faef',
          borderRadius: 20,
          paddingHorizontal: 15,
        }}
        listViewProps={{
          style: { backgroundColor: 'transparent' },
        }}
      />
      {isChatLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        >
          <ActivityIndicator size="large" color="#477572" />
        </View>
      )}
    </LinearGradient>
  );
};

export default ChatSingle;