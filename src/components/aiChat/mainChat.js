import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  useColorScheme,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import ImageViewer from 'react-native-image-zoom-viewer';
import RNFS from 'react-native-fs';

import { GiftedChat, Send, Bubble, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { BASE_INFO } from "../../constant/base";
import { Shadow } from "react-native-shadow-2";
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { pick, types, isCancel } from '@react-native-documents/picker';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from "react-native-fast-image";
import { useToast } from "../tip/ToastHooks";

import SquareGridBackground from "../misc/SquareGridBackground";
import PatternSVG from "../../assets/background/pattern.svg";

const CHAT_HISTORY_KEY = '@chat_history_';
const TOPIC_HISTORY_KEY = '@topic_list';
const MAX_TOPICS = 2;

const MainChat = () => {
  const [messages, setMessages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const colorScheme = useColorScheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const isDarkMode = colorScheme === "dark";

  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState('');
  const { showToast } = useToast();

  // State for image source selection modal
  const [isImagePickerModalVisible, setIsImagePickerModalVisible] = useState(false);

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
              name: '聪宝',
              avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
            },
          },
        ]));
      }

      setTopics(parsedTopics);
      setSelectedTopic(parsedTopics[0]);
    } catch (e) {
      console.error('加载话题失败:', e);
      showToast('加载话题失败，请重试。', 'error');
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
              name: '聪宝',
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

  const onSend = useCallback(
    async (newMessages = []) => {
      const text = inputText.trim();
      let imageData = null;

      setInputText('');

      if (selectedFile) {
        if (selectedFile.type === 'image') {
          try {
            const filePath = Platform.OS === 'ios' ? selectedFile.uri.replace('file://', '') : selectedFile.uri;
            const base64Image = await RNFS.readFile(filePath, 'base64');
            imageData = `data:${selectedFile.mimeType || 'image/jpeg'};base64,${base64Image}`;
            setSelectedFile(null);
          } catch (error) {
            showToast('无法读取图片，请重试。', 'error');
            setSelectedFile(null); // 使用后删除照片
            return;
          }
        } else if (selectedFile.type == 'document') {
          try {
            const filePath = Platform.OS == 'ios' ? selectedFile.url.replace('file://', '') : selectedFile.url;
            const base64Image = await RNFS.readFile(filePath, 'base64');
            setSelectedFile(null); // 未开发
          } catch {
            console.log("[onSend]函数: 无法加载document，请重重试！");
            setSelectedFile(null);
            return;
          }
        }
      }

      if (text !== '' || selectedFile) {
        const combinedMessage = {
          _id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          user: { _id: 1 },
          text: text || '',
        };

        if (selectedFile) {
          if (selectedFile.type === 'image') {
            combinedMessage.image = selectedFile.uri;
          } else if (selectedFile.type === 'document') {
            combinedMessage.file = {
              uri: selectedFile.uri,
              name: selectedFile.name,
              type: selectedFile.type,
            };
          }
        }

        const updatedMessagesWithUser = GiftedChat.append(messages, [combinedMessage]);
        setMessages(updatedMessagesWithUser);
        await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${selectedTopic}`, JSON.stringify(updatedMessagesWithUser));

        setIsChatLoading(true);
        try {
          if (text || imageData) {
            await fetchChatGPTResponse(text, imageData, updatedMessagesWithUser);
          } else {
            setIsChatLoading(false);
          }
        } finally {
          setSelectedFile(null);
        }
      }
    },
    [inputText, selectedFile, messages, selectedTopic]
  );

  const fetchChatGPTResponse = async (inputText, imageData, currentChatMessages) => {
    const url = BASE_INFO.chat.url + '/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
    };

    let messagesForApi = [];

    if (imageData) {
      messagesForApi.push({
        role: 'user',
        content: [
          { type: 'text', text: inputText || '描述这张图片' },
          { type: 'image_url', image_url: { url: imageData } }
        ]
      });
    } else if (inputText) {
      messagesForApi.push({ role: 'user', content: inputText });
    } else {
      setIsChatLoading(false);
      return;
    }

    const data = {
      model: BASE_INFO.chat.model,
      messages: messagesForApi,
      stream: false,
    };

    try {
      const response = await axios.post(url, data, { headers });
      const assistantResponse = response.data.choices[0]?.message?.content || '抱歉，我没有理解你的问题。';

      const assistantMessage = {
        _id: Math.random().toString(36).substring(7),
        text: assistantResponse,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: '聪宝',
          avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
        },
      };

      const updatedMessages = GiftedChat.append(currentChatMessages, [assistantMessage]);
      setMessages(updatedMessages);
      await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${selectedTopic}`, JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('请求失败:', error.response ? error.response.data : error.message);
      const errorMessage = {
        _id: Math.random().toString(36).substring(7),
        text: `请求失败: ${error.response?.data?.error?.message || error.message || '未知错误'}`,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: '聪宝',
          avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
        },
      };
      const updatedMessagesWithError = GiftedChat.append(currentChatMessages, [errorMessage]);
      setMessages(updatedMessagesWithError);
      await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${selectedTopic}`, JSON.stringify(updatedMessagesWithError));
    } finally {
      setIsChatLoading(false);
    }
  };

  const createNewTopic = async () => {
    const name = newTopicName.trim();
    if (!name) {
      showToast('请输入话题名称', 'error');
      return;
    }

    if (topics.length >= MAX_TOPICS) {
      showToast(`最多只能创建 ${MAX_TOPICS} 个话题，请删除旧话题后再创建新的。`, 'error');
      setIsModalVisible(false);
      setNewTopicName('');
      return;
    }

    if (topics.includes(name)) {
      showToast('该话题已存在', 'error');
      return;
    }

    const welcomeMessage = {
      _id: 1,
      text: '你好！我是聪宝，有什么可以帮你的吗？',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: '聪宝',
        avatar: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png',
      },
    };

    const updatedTopics = [name, ...topics].slice(0, MAX_TOPICS);
    setTopics(updatedTopics);
    setSelectedTopic(name);
    setIsModalVisible(false);

    await AsyncStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(updatedTopics));
    await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}${name}`, JSON.stringify([welcomeMessage]));

    setMessages([welcomeMessage]);
    setNewTopicName('');
  };

  const deleteCurrentTopic = async () => {
    if (topics.length <= 1) {
      showToast('至少保留一个话题', 'error');
      return;
    }

    const updatedTopics = topics.filter(topic => topic !== selectedTopic);
    const newSelectedTopic = updatedTopics[0];

    setTopics(updatedTopics);
    setSelectedTopic(newSelectedTopic);

    await AsyncStorage.removeItem(`${CHAT_HISTORY_KEY}${selectedTopic}`);
    await AsyncStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(updatedTopics));
    await loadChatHistory(newSelectedTopic);
  };

  const pickFile = async () => {
    setSelectedFile(null);
    try {
      const [pickResult] = await pick({
        type: [
          types.pdf,
          types.docx,
          types.doc,
        ],
        mode: 'open',
        allowMultiSelection: false,
      });

      if (pickResult) {
        console.log("selected file:", pickResult);
        setSelectedFile({ ...pickResult, type: 'document' });
      } else {
        console.log('用户取消了文件选择');
      }
    } catch (err) {
      if (isCancel(err)) {
        console.log('用户取消了文件选择');
      } else {
        console.error('文件选择失败:', err);
      }
    }
  };

  const selectImageFromGallery = async () => {
    setIsImagePickerModalVisible(false);
    setSelectedFile(null);
    const options = {
      mediaType: 'photo',
      quality: 0.9,
      includeBase64: false,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('用户取消了图片选择');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        console.log("图片已选择:", asset);
        setSelectedFile({ type: 'image', uri: asset.uri, mimeType: asset.type });
      }
    });
  };

  const takePhoto = async () => {
    setIsImagePickerModalVisible(false);
    setSelectedFile(null);
    const options = {
      mediaType: 'photo',
      quality: 0.9,
      includeBase64: false,
      saveToPhotos: true,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('用户取消了拍照');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorCode);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        console.log("照片已拍摄:", asset);
        setSelectedFile({ type: 'image', uri: asset.uri, mimeType: asset.type });
      }
    });
  };


  const renderMessageImage = (props) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setCurrentImageUri(props.currentMessage.image);
          setIsImageViewerVisible(true);
        }}
      >
        <FastImage
          source={{ uri: props.currentMessage.image }}
          style={{ width: 100, height: 100, borderRadius: 10}}
          resizeMode={FastImage.resizeMode.cover}
        />
      </TouchableOpacity>
    );
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;

    return (
      <View>
        {currentMessage.file && (
          <View className="px-3 py-4 bg-gray-200 dark:bg-gray-800 rounded-lg self-start my-1 max-w-xs">
            <TouchableOpacity onPress={() => Linking.openURL(currentMessage.file.uri)}>
              <Text className="text-blue-600">{currentMessage.file.name}</Text>
            </TouchableOpacity>
          </View>
        )}
        {currentMessage.text && <Bubble
          {...props}
          wrapperStyle={{
            left: { // AI消息气泡样式
              backgroundColor: isDarkMode ? '#2f312a' : '#e8e9de',
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
              backgroundColor: isDarkMode ? '#8a9579' : '#477572',
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
            left: { // AI文本样式
              color: isDarkMode ? '#fff' : '#000',
            },
            right: { // 发送者文本样式
              color: isDarkMode ? '#fff' : '#fff',
            },
          }}
        />}
      </View>
    );
  };

  const renderSend = props => {
    return (
      <Send {...props}>
        <View className="mr-2 ml-2 mb-2 p-2 bg-blue-500 rounded-full self-center justify-center">
          <MaterialIcon name={"send"} size={16} color={isDarkMode ? '#eee' : '#fff'} />
        </View>
      </Send>
    );
  };


  const renderActions = () => {
    return (
      <View className="flex-row items-center mr-2 justify-center self-center ml-3">
        <TouchableOpacity onPress={() => setIsImagePickerModalVisible(true)} className='mr-2' disabled={!!selectedFile}>
          <MaterialIcon name={"photo"} size={25} color={selectedFile ? '#aaa' : (isDarkMode ? '#eee' : '#000')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={pickFile} disabled={!!selectedFile}>
          <MaterialIcon name={"attachment"} size={25} color={selectedFile ? '#aaa' : (isDarkMode ? '#eee' : '#000')} />
        </TouchableOpacity>
      </View>
    );
  };

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

  const renderImageSourceSelectionModal = () => (
    <Modal
      visible={isImagePickerModalVisible}
      animationType="fade"
      transparent
      onRequestClose={() => setIsImagePickerModalVisible(false)}
    >
      <View className="flex-1 justify-center bg-black/50 p-4">
        <View className="bg-white dark:bg-gray-800 p-5 rounded-lg mx-4">
          <Text className="text-lg font-semibold mb-5 text-black dark:text-gray-300 text-center">选择图片来源</Text>
          <Pressable
            onPress={selectImageFromGallery}
            className="px-4 py-3 rounded bg-blue-500 dark:bg-blue-600 mb-3 items-center"
          >
            <Text className="text-white text-base">从相册选择</Text>
          </Pressable>
          <Pressable
            onPress={takePhoto}
            className="px-4 py-3 rounded bg-green-500 dark:bg-green-600 mb-4 items-center"
          >
            <Text className="text-white text-base">拍照</Text>
          </Pressable>
          <Pressable
            onPress={() => setIsImagePickerModalVisible(false)}
            className="px-4 py-3 rounded bg-gray-200 dark:bg-gray-700 items-center"
          >
            <Text className="text-black dark:text-gray-300 text-base">取消</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? "#2f312a" : "#f9faef" }}>
      <Shadow distance={10}>
        <View className="p-2 flex-row items-center justify-between shadow rounded-lg w-full " style={{ backgroundColor: isDarkMode ? "#2f312a" : "#f9faef", }}>
          <View className="flex-1 mr-2 ">
            <Text className="text-sm text-gray-700 dark:text-white mb-1">选择话题:</Text>
            <View className="border border-gray-300 rounded l" style={{ backgroundColor: isDarkMode ? "#2f312a" : "#f9faef", }}>
              <Picker
                selectedValue={selectedTopic}
                onValueChange={(value) => setSelectedTopic(value)}
                style={{
                  height: 55,
                  width: '100%',
                  color: isDarkMode ? '#eee' : '#000',
                  borderRadius: 10,
                }}
                dropdownIconColor={isDarkMode ? '#eee' : '#000'}
              >
                {topics.map((topic) => (
                  <Picker.Item key={topic} label={topic} value={topic} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            className="bg-[#667157] dark:bg-[#354e16] p-3 mt-6 rounded-full self-center ml-1"
          >
            <MaterialIcon name={"add"} size={15} color={isDarkMode ? '#eee' : '#eee'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteCurrentTopic}
            className="bg-[#8f4c38] dark:bg-[#7d3030] p-3 mt-6 rounded-full self-center ml-3"
          >
            <MaterialIcon name={"delete"} size={15} color={isDarkMode ? '#eee' : '#eee'} />
          </TouchableOpacity>
        </View>
      </Shadow>

      {isDarkMode ? (
        <View style={{ flex: 1 }}>
          <SquareGridBackground
            pattern={PatternSVG}
            size={70}
          />
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: 1 }}
            placeholder="输入消息..."
            renderUsernameOnMessage
            isKeyboardInternallyDisabled={isChatLoading}
            renderBubble={renderMessage}
            renderMessageImage={renderMessageImage}
            renderActions={renderActions}
            renderSend={renderSend}
            bottomOffset={Platform.OS === 'ios' ? 34 : 0}
            keyboardShouldPersistTaps="handled"
            renderInputToolbar={renderInputToolbar}
            textInputStyle={{
              color: isDarkMode ? '#fff' : '#000',
              fontSize: 16,
              padding: 10,
              maxHeight: 100,
              minHeight: 40,
              flex: 1,
              backgroundColor: isDarkMode ? "#12140e" : "#f9faef",
              borderRadius: 20,
              paddingHorizontal: 15,
            }}
            text={inputText}
            renderChatFooter={() => (
              selectedFile ? (
                <View style={{
                  flexDirection: 'row',
                  padding: 10,
                  alignItems: 'center',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9',
                  borderTopWidth: 1,
                  borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
                }}>
                  {selectedFile.type === "image" ? (
                    <TouchableOpacity
                      onPress={() => {
                        setCurrentImageUri(selectedFile.uri);
                        setIsImageViewerVisible(true);
                      }}
                    >
                      <FastImage
                        source={{ uri: selectedFile.uri }}
                        style={{ width: 100, height: 100, borderRadius: 16, marginRight: 10 }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ padding: 10, backgroundColor: isDarkMode ? '#333' : '#ddd', borderRadius: 16, width: 100, height: 100, overflow: 'hidden' }}>
                      <Text style={{ color: isDarkMode ? '#eee' : '#000' }}>{selectedFile.name || '文件'}</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => setSelectedFile(null)} style={{ marginLeft: 5, position: 'absolute', top: 5, left: 85 }} className='bg-gray-300 dark:bg-gray-600 rounded-full p-1'>
                    <MaterialIcon name="close" size={20} color={isDarkMode ? '#aaa' : '#888'} />
                  </TouchableOpacity>
                </View>
              ) : null
            )}
            onInputTextChanged={setInputText}
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          />
        </View>
      ) : (
        <LinearGradient
          colors={['#f0f9eb', '#c9e5b5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        >
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: 1 }}
            placeholder="输入消息..."
            renderUsernameOnMessage
            isKeyboardInternallyDisabled={isChatLoading}
            renderBubble={renderMessage}
            renderMessageImage={renderMessageImage}
            renderActions={renderActions}
            renderSend={renderSend}
            bottomOffset={Platform.OS === 'ios' ? 34 : 0}
            keyboardShouldPersistTaps="handled"
            renderInputToolbar={renderInputToolbar}
            textInputStyle={{
              color: isDarkMode ? '#fff' : '#000',
              fontSize: 16,
              padding: 10,
              maxHeight: 100,
              minHeight: 40,
              flex: 1,
              backgroundColor: isDarkMode ? "#12140e" : "#f9faef",
              borderRadius: 20,
              paddingHorizontal: 15,
            }}
            text={inputText}
            renderChatFooter={() => (
              selectedFile ? (
                <View style={{
                  flexDirection: 'row',
                  padding: 10,
                  alignItems: 'center',
                  backgroundColor: isDarkMode ? '#1e1e1e' : '#f9f9f9',
                  borderTopWidth: 1,
                  borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
                }}>
                  {selectedFile.type === "image" ? (
                    <TouchableOpacity
                      onPress={() => {
                        setCurrentImageUri(selectedFile.uri);
                        setIsImageViewerVisible(true);
                      }}
                    >
                      <FastImage
                        source={{ uri: selectedFile.uri }}
                        style={{ width: 100, height: 100, borderRadius: 16, marginRight: 10 }}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={{ padding: 10, backgroundColor: isDarkMode ? '#333' : '#ddd', borderRadius: 16, width: 100, height: 100, overflow: 'hidden' }}>
                      <Text style={{ color: isDarkMode ? '#eee' : '#000' }}>{selectedFile.name || '文件'}</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => setSelectedFile(null)} style={{ marginLeft: 5, position: 'absolute', top: 5, left: 85 }} className='bg-gray-300 dark:bg-gray-600 rounded-full p-1'>
                    <MaterialIcon name="close" size={20} color={isDarkMode ? '#aaa' : '#888'} />
                  </TouchableOpacity>
                </View>
              ) : null
            )}
            onInputTextChanged={setInputText}
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          />
        </LinearGradient>
      )}


      <Modal visible={isModalVisible} animationType="fade" transparent hardwareAccelerated={true}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white dark:bg-gray-800 p-5 rounded-lg mx-4">
            <Text className="text-lg font-semibold mb-3 text-black dark:text-gray-300">输入新话题名称：</Text>
            <TextInput
              value={newTopicName}
              onChangeText={setNewTopicName}
              className="border border-gray-300 p-3 rounded mb-4 text-black dark:text-gray-300"
              placeholder="输入新话题名称"
              style={{
                height: 55,
              }}
              placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
            />
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-300"
              >
                <Text>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createNewTopic}
                className="px-4 py-2 ml-4 rounded bg-green-500 dark:bg-green-600"
              >
                <Text className="text-white dark:text-gray-100">创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isImageViewerVisible} transparent={true} onRequestClose={() => setIsImageViewerVisible(false)}>
        <TouchableOpacity onPress={() => setIsImageViewerVisible(false)} style={{ position: 'absolute', top: 15, left: 10, zIndex: 1 }} className='bg-gray-300 dark:bg-gray-600 p-2 rounded-full z-0'>
          <MaterialIcon name={"close"} size={30} style={{
            color: isDarkMode ? '#eee' : '#000',
          }} />
        </TouchableOpacity>
        <ImageViewer
          imageUrls={[{ url: currentImageUri }]}
          enableSwipeDown
          onCancel={() => setIsImageViewerVisible(false)}
          renderIndicator={() => null}
          backgroundColor="rgba(0,0,0,0.8)"
        />
      </Modal>

      {renderImageSourceSelectionModal()}
    </SafeAreaView>
  );
};

export default MainChat;