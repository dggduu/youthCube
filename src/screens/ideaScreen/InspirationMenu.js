import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, ScrollView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useColorScheme } from 'nativewind';
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";
import { getItemFromAsyncStorage } from "../../utils/LocalStorage";
import { BASE_INFO } from "../../constant/base";
import CustomAlert from "../../components/custom/CustomAlert";
import InputBox from "../../components/inputBox/inputBox";

const api = axios.create();
setupAuthInterceptors(api);

const MAX_MESSAGE_LENGTH = 500;
const ITEMS_PER_PAGE = 4;

const fetchMyBullets = async (token) => {
  if (!token) return [];
  try {
    const response = await api.get(`${BASE_INFO.BASE_URL}api/thoughbullet/myself`, {
      params: { page: 0, size: 100 },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching my bullets:', error);
    return [];
  }
};

const fetchAllBullets = async (token) => {
  if (!token) return [];
  try {
    const response = await api.get(`${BASE_INFO.BASE_URL}api/thoughbullet`, {
      params: { page: 0, size: 100 },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching all bullets:', error);
    return [];
  }
};

const InspirationMenu = () => {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [myBullets, setMyBullets] = useState([]);
  const [allBullets, setAllBullets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [editingBullet, setEditingBullet] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentMyPage, setCurrentMyPage] = useState(1);
  const [accessToken, setAccessToken] = useState(null);

  const displayedMyBullets = myBullets.slice(
    (currentMyPage - 1) * ITEMS_PER_PAGE,
    currentMyPage * ITEMS_PER_PAGE
  );
  const totalMyPages = Math.ceil(myBullets.length / ITEMS_PER_PAGE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getItemFromAsyncStorage('accessToken');
      setAccessToken(token);
      if (!token) {
        setLoading(false);
        return;
      }
      const [myData, allData] = await Promise.all([
        fetchMyBullets(token),
        fetchAllBullets(token)
      ]);
      setMyBullets(myData);
      setAllBullets(allData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, [fetchData]);

  const prevPage = () => currentMyPage > 1 && setCurrentMyPage(currentMyPage - 1);
  const nextPage = () => currentMyPage < totalMyPages && setCurrentMyPage(currentMyPage + 1);

  const handleBulletSubmit = async () => {
    if (!accessToken) {
      return;
    }
    try {
      if (editingBullet) {
        await api.put(`${BASE_INFO.BASE_URL}api/thoughbullet/${editingBullet.id}`, { 
          message: newMessage 
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } else {
        await api.post(`${BASE_INFO.BASE_URL}api/thoughbullet`, { 
          message: newMessage 
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
      setNewMessage('');
      setEditingBullet(null);
      setModalVisible(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving bullet:', error);
    }
  };

  const deleteBullet = async () => {
    if (!accessToken || !deleteId) return;
    try {
      await api.delete(`${BASE_INFO.BASE_URL}api/thoughbullet/${deleteId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setDeleteId(null);
      setAlertVisible(false);
      await fetchData();
    } catch (error) {
      console.error('Error deleting bullet:', error);
    }
  };

  const renderMyBulletItem = ({ item }) => (
    <View className={`p-3 mb-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <ScrollView 
        nestedScrollEnabled 
        style={{ maxHeight: Dimensions.get('window').height * 0.2 }}
      >
        <Text className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {item.message}
        </Text>
      </ScrollView>
      <View className="flex-row justify-end mt-2">
        <TouchableOpacity 
          onPress={() => {
            setEditingBullet(item);
            setNewMessage(item.message);
            setModalVisible(true);
          }}
          className="mr-3"
        >
          <MaterialIcons name="edit" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          setDeleteId(item.id);
          setAlertVisible(true);
        }}>
          <MaterialIcons name="delete" size={18} color={isDark ? '#ef4444' : '#dc2626'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAllBulletItem = ({ item }) => (
    <View 
      className={`p-3 mb-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} 
      style={{ width: Math.random() > 0.5 ? '48%' : '100%' }}
    >
      <ScrollView 
        nestedScrollEnabled 
        style={{ maxHeight: Dimensions.get('window').height * 0.15 }}
      >
        <Text className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {item.message}
        </Text>
      </ScrollView>
      <Text className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        - {item.author?.name || '匿名用户'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} />
        <Text className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>正在加载数据...</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            我的弹幕
          </Text>
          {myBullets.length > ITEMS_PER_PAGE && (
            <View className="flex-row items-center">
              <TouchableOpacity onPress={prevPage} disabled={currentMyPage === 1}>
                <MaterialIcons 
                  name="chevron-left" 
                  size={24} 
                  color={currentMyPage === 1 ? 
                    (isDark ? '#4b5563' : '#9ca3af') : 
                    (isDark ? '#ffffff' : '#000000')} 
                />
              </TouchableOpacity>
              <Text className={`mx-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {currentMyPage}/{totalMyPages}
              </Text>
              <TouchableOpacity onPress={nextPage} disabled={currentMyPage === totalMyPages}>
                <MaterialIcons 
                  name="chevron-right" 
                  size={24} 
                  color={currentMyPage === totalMyPages ? 
                    (isDark ? '#4b5563' : '#9ca3af') : 
                    (isDark ? '#ffffff' : '#000000')} 
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {myBullets.length === 0 ? (
          <Text className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            暂无弹幕，点击下方按钮添加
          </Text>
        ) : (
          <FlatList
            data={displayedMyBullets}
            renderItem={renderMyBulletItem}
            keyExtractor={item => item.id.toString()}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
      <TouchableOpacity
        onPress={() => {
          setEditingBullet(null);
          setNewMessage('');
          setModalVisible(true);
        }}
        className={`absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg ${
          isDark ? 'bg-blue-600' : 'bg-[#409eff]'
        }`}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`p-5 rounded-lg w-4/5 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {editingBullet ? '编辑弹幕' : '添加弹幕'}
            </Text>
            <InputBox
              placeholder="输入你的想法 (最多500个字符)..."
              value={newMessage}
              onChangeText={(text) => text.length <= MAX_MESSAGE_LENGTH && setNewMessage(text)}
              multiline
              numberOfLines={4}
              maxLength={MAX_MESSAGE_LENGTH}
              className={`${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
            />
            <Text className={`text-xs text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {newMessage.length}/{MAX_MESSAGE_LENGTH}
            </Text>
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className={`px-4 py-2 rounded-lg mr-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <Text className={isDark ? 'text-gray-200' : 'text-gray-800'}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBulletSubmit}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-[#409eff]'}`}
                disabled={!newMessage.trim()}
              >
                <Text className="text-white">{editingBullet ? '更新' : '创建'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title="删除弹幕"
        message="确定要删除这条弹幕吗？此操作无法撤销。"
        buttons={[
          {
            text: '取消',
            style: 'cancel',
            onPress: () => setAlertVisible(false)
          },
          {
            text: '删除',
            style: 'destructive',
            onPress: deleteBullet
          }
        ]}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default InspirationMenu;