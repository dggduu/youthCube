import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';

import { GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { BASE_URL } from "../../constant/url";

const CHAT_HISTORY_KEY = '@chat_history_';
const TOPIC_HISTORY_KEY = '@topic_list';
const MAX_TOPICS = 5;

const MainChat = () => {
  const [messages, setMessages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadTopics = async () => {
    try {
      const topicList = await AsyncStorage.getItem(TOPIC_HISTORY_KEY);
      let parsedTopics = topicList ? JSON.parse(topicList) : [];

      if (parsedTopics.length === 0) {
        const defaultTopic = '默认话题';
        parsedTopics = [defaultTopic];
        await AsyncStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(parsedTopics));
        await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${defaultTopic}`, JSON.stringify([
          {
            _id: 1,
            text: '你好！我是聪宝，有什么可以帮你的吗？',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'ChatGPT',
              avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
            },
          },
        ]));
      }

      setTopics(parsedTopics);
      setSelectedTopic(parsedTopics[0]);
    } catch (e) {
      console.error('加载话题失败:', e);
    }
  };

  const loadChatHistory = async (topicId) => {
    try {
      const history = await AsyncStorage.getItem(`${CHAT_HISTORY_KEY}${topicId}`);
      if (history) {
        setMessages(JSON.parse(history));
      } else {
        const initialMessage = [
          {
            _id: 1,
            text: '你好！我是聪宝，有什么可以帮你的吗？',
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'ChatGPT',
              avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
            },
          },
        ];
        setMessages(initialMessage);
        await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${topicId}`, JSON.stringify(initialMessage));
      }
    } catch (e) {
      console.error('读取聊天记录失败:', e);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      loadChatHistory(selectedTopic);
    }
  }, [selectedTopic]);

  useEffect(() => {
    loadTopics();
  }, []);

useEffect(() => {
    console.log("当前话题列表:", topics);
    console.log("当前选择的话题:", selectedTopic);
    console.log("当前消息列表:", messages);
  }, [topics, selectedTopic, messages]);

  const onSend = useCallback(
    async (newMessages = []) => {
      const updatedMessages = GiftedChat.append(messages, newMessages);
      setMessages(updatedMessages);
      await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${selectedTopic}`, JSON.stringify(updatedMessages));

      fetchChatGPTResponse(newMessages[0].text);
    },
    [messages, selectedTopic]
  );

  const fetchChatGPTResponse = async (inputText) => {
    const url = 'http://10.69.57.141:1234/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
    };

    const data = {
      model: 'qwen3-8b',
      messages: [{ role: 'user', content: inputText }],
      stream: false,
    };

    try {
      const response = await axios.post(url, data, {
        headers,
      });

      const assistantResponse = response.data.choices[0]?.message?.content || '抱歉，我没有理解你的问题。';

      const assistantMessage = {
        _id: Math.random().toString(36).substring(7),
        text: assistantResponse,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'ChatGPT',
          avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
        },
      };

      // 更新消息列表
      const updatedMessages = GiftedChat.append(messages, [assistantMessage]);
      setMessages(updatedMessages);

      // 保存到 AsyncStorage
      await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${selectedTopic}`, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('请求失败:', error);
      const errorMessage = {
        _id: Math.random().toString(36).substring(7),
        text: '请求失败，请检查网络或稍后再试。',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'ChatGPT',
          avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
        },
      };
      const updatedMessages = GiftedChat.append(messages, [errorMessage]);
      setMessages(updatedMessages);
      await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${selectedTopic}`, JSON.stringify(updatedMessages));
    }
  };

  // 新建话题
  const createNewTopic = async () => {
    const name = newTopicName.trim();
    if (!name) {
      alert('请输入话题名称');
      return;
    }

    if (topics.includes(name)) {
      alert('该话题已存在');
      return;
    }

    const updatedTopics = [name, ...topics.filter((t) => t !== name)].slice(0, MAX_TOPICS);
    setTopics(updatedTopics);
    setSelectedTopic(name);
    setIsModalVisible(false);

    await AsyncStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(updatedTopics));
    await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${name}`, JSON.stringify([])); // 空记录
    setMessages([]);
    setNewTopicName('');
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
      <View className="flex-1 bg-white dark:bg-black">
        {/* 顶部操作栏 */}
        <View className="p-3 bg-gray-100 flex-row items-center justify-between">
          {/* 话题选择器 */}
          <View className="flex-1 mr-2">
            <Text className="text-sm text-gray-700 mb-1">选择话题:</Text>
            <View className="border border-gray-300 rounded overflow-hidden bg-white">
              <Picker
                selectedValue={selectedTopic}
                onValueChange={(value) => setSelectedTopic(value)}
                style={{ height: 40 }}
                dropdownIconColor="#000"
              >
                {topics.map((topic) => (
                  <Picker.Item key={topic} label={topic} value={topic} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 新建话题按钮 */}
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            className="bg-green-500 px-4 py-2 rounded self-end"
          >
            <Text className="text-white font-bold">新建话题</Text>
          </TouchableOpacity>
        </View>

        {/* 聊天界面 */}
        <GiftedChat
          messages={messages}
          onSend={(newMessages) => onSend(newMessages)}
          user={{
            _id: 1,
          }}
          placeholder="输入消息..."
          renderUsernameOnMessage
        />

        {/* 新建话题模态框 */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View className="flex-1 justify-center bg-black/50 p-4">
            <View className="bg-white p-5 rounded-lg mx-4">
              <Text className="text-lg font-semibold mb-3">输入新话题名称：</Text>
              <TextInput
                value={newTopicName}
                onChangeText={setNewTopicName}
                className="border border-gray-300 p-3 rounded mb-4"
                placeholder="例如：旅行攻略"
              />
              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  <Text>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={createNewTopic}
                  className="px-4 py-2 rounded bg-green-500"
                >
                  <Text className="text-white font-bold">创建</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default MainChat;