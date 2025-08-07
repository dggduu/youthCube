import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Pressable,
  useColorScheme
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { setItemToAsyncStorage, getItemFromAsyncStorage } from '../../utils/LocalStorage';
import { BASE_INFO } from '../../constant/base';
import { navigate } from '../../navigation/NavigatorRef';
import setupAuthInterceptors from '../../utils/axios/AuthInterceptors';
import InspirationCarousel from '../../components/chart/InspirationCarousel';
import CarouselStart from '../../components/custom/CarouselStart';
import axios from 'axios';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import TeamCard from '../../components/feedElem/TeamCard';

const api = axios.create();
setupAuthInterceptors(api);
const screenWidth = Dimensions.get('window').width;

export default function IeaMarketScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const flatListRef = useRef(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = await getItemFromAsyncStorage('user');
        if (!userString) {
          setLoading(false);
          return;
        }
        const userObj = userString;
        const userId = userObj.id;

        const response = await axios.get(`${BASE_INFO.BASE_URL}api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${await getItemFromAsyncStorage('accessToken')}`,
          },
        });

        await setItemToAsyncStorage('user', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch team data
  const fetchTeamData = async (pageNum = 0) => {
    if (!hasMore && pageNum > 0) return;

    try {
      const url = `${BASE_INFO.BASE_URL}api/teams?page=${pageNum}&size=15`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${await getItemFromAsyncStorage('accessToken')}`,
        },
      });

      const result = response.data;
      const newData = result.items.map((item) => ({
        id: item.team_id,
        title: item.team_name,
        img_url: item.img_url,
        grade: item.grade,
        subtitle: new Date(item.create_at).toLocaleDateString(),
        tags: item.tags || [],
        height: 250,
      }));

      setTotalPages(result.totalPages);
      if (pageNum >= result.totalPages - 1) {
        setHasMore(false);
      }

      if (pageNum === 0) {
        setTeamData(newData);
      } else {
        setTeamData((prev) => [...prev, ...newData]);
      }

      setPage(pageNum + 1);
    } catch (error) {
      console.error('Error fetching team data:', error);
      if (pageNum === 0) {
        setTeamData([]);
      }
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true);
    fetchTeamData(0).finally(() => setRefreshing(false));
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchTeamData(page);
    }
  };

  const onTeamPress = (item) => {
    navigate('RootIdea', {
      screen: 'TeamDetail',
      params: {
        teamId: item.id,
        teamName: item.title,
      },
    });
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // === Header Component ===
  const renderHeader = () => (
    <View className="mt-8 px-5 space-y-6">
     <View className="flex-row justify-between items-center mb-4 mt-5">
        <Text
          style={{
            fontFamily: "NotoSerifSC",
            flex: 1,
          }}
          className="text-4xl text-black dark:text-white mb-1"
        >
          想法市场
        </Text>
      </View>

      <View className="flex-row gap-3 mb-1">
        {/* 项目进度*/}
        <TouchableOpacity
          className="flex-1 rounded-lg bg-blue-500 dark:bg-blue-800 shadow-lg"
          onPress={() => {
            navigate('RootIdea', { 
              screen: 'Progress', 
              params: { screen: 'TimeLine', params: { screen: "TimeLine" } } 
            });
          }}
        >
          <View className="py-4 items-center justify-center gap-2">
            <MaterialIcons name="timeline" size={24} color="white" />
            <Text className="text-white font-medium">项目进度</Text>
          </View>
        </TouchableOpacity>

        {/* 聊天服务*/}
        <TouchableOpacity
          className="flex-1 rounded-lg bg-emerald-500 dark:bg-emerald-800 shadow-lg"
          onPress={() => {
            navigate('RootIdea', { screen: 'Chat', params: { screen: 'section' } });
          }}
        >
          <View className="py-4 items-center justify-center gap-2">
            <MaterialIcons name="chat" size={24} color="white" />
            <Text className="text-white font-medium">聊天服务</Text>
          </View>
        </TouchableOpacity>

        {/* 创建团队*/}
        <TouchableOpacity
          className="flex-1 rounded-lg bg-purple-500 dark:bg-purple-800 shadow-lg"
          onPress={() => {
            navigate('RootIdea', { screen: 'CreateFlow', params: { screen: 'Create' } });
          }}
        >
          <View className="py-4 items-center justify-center gap-2">
            <MaterialIcons name="groups" size={24} color="white" />
            <Text className="text-white font-medium">创建团队</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 轮播图 */}
      <View className="flex-row justify-around mb-5">
          <CarouselStart
            onItemPress={(url) =>
              navigate('RootIdea', { screen: 'webview', params: { url } })
            }
          />
          <InspirationCarousel
            onMenuPress={() =>
              navigate('RootIdea', {
                screen: 'menu',
                params: { user_id: user?.id, user_name: user?.name },
              })
            }
          />
      </View>

      {/* 团队标题 */}
      <Text className="font-semibold text-xl text-gray-700 dark:text-gray-200">
        推荐团队
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="flex-row justify-center items-center py-6">
        <ActivityIndicator size="small" color="#6366f1" />
        <Text className="ml-2 text-gray-500 dark:text-gray-400 text-sm">加载中...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading || refreshing) return null;
    return (
      <View className="flex-1 justify-center items-center mt-20">
        <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
          <MaterialIcons name="folder-off" size={32} color="#9ca3af" />
        </View>
        <Text className="mt-4 text-lg text-gray-500 dark:text-gray-400">暂无团队</Text>
      </View>
    );
  };

  if (loading && !user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        ref={flatListRef}
        data={teamData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
              <TeamCard
                title={item.title}
                subtitle={item.subtitle}
                tags={item.tags.slice(0, 4)}
                img_url={item.img_url}
                grade={item.grade}
                onPress={() => onTeamPress(item)}
              />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}