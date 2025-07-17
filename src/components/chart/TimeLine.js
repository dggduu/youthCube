import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, RefreshControl } from 'react-native';
import Timeline from 'react-native-timeline-flatlist';
import { useColorScheme } from 'react-native';
import { getItemFromAsyncStorage } from '../../utils/LocalStorage';
import { BASE_INFO } from '../../constant/base';
import { useToast } from '../../components/tip/ToastHooks';
import { useNavigation } from "@react-navigation/native";
// 类型颜色
const getColorByType = (type, isDark) => {
  switch (type) {
    case 'meeting': return '#f8e287';
    case 'deadline': return '#f87171';
    case 'competition': return '#bcece7';
    case 'progress_report': return '#c5ecce';
    default: return isDark ? '#1a1a1a' : '#888';
  }
};

// 状态颜色
const getColorByStatus = (status) => {
  switch (status) {
    case 'accept': return '#10b981';
    case 'pending': return '#555';
    case 'reject': return '#ef4444';
    default: return '#9ca3af';
  }
};

// 日期格式化函数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}\n${month}月${day}日`;
};

const TimeLine = ({ teamId, role}) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToast();
  const navigation = useNavigation()

  // 获取数据
  const fetchData = async (pageNum = 0, isRefresh = false) => {
    try {
      if (pageNum === 0 && isRefresh) setIsRefreshing(true);
      else if (pageNum === 0) setIsLoading(true);
      else setIsLoading(true);

      const token = await getItemFromAsyncStorage('accessToken');
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/team/${teamId}/progress?page=${pageNum}&size=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);
      if (result.items && result.items.length > 0) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const formattedData = result.items
          .map((item) => {
            const eventDate = new Date(item.event_time);
            eventDate.setHours(0, 0, 0, 0);
            const isPast = eventDate <= now;

            return {
              time: formatDate(item.event_time),
              title: item.title || '未填写标题',
              description: '',
              icon: null,
              lineColor: isPast ? '#3b82f6' : '#555',
              status:
                item.status === 'pending'
                  ? '待处理'
                  : item.status === 'accept'
                  ? '已通过'
                  : '已拒绝',
              statusKey: item.status,
              type: item.timeline_type || 'default',
              eventTime: item.event_time,
              progressId: item.progress_id,
              userName : item.submitter.name
            };
          })
          .sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime));

        setData((prev) =>
          pageNum === 0 ? formattedData : [...prev, ...formattedData]
        );
        setPage(pageNum);
        if (result.items.length < 20) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        if (pageNum === 0) {
          setData([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching timeline data:', error);
      showToast('加载失败，请重试');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, [teamId]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchData(page + 1);
    }
  };

  const onRefresh = () => {
    fetchData(0, true);
  };

  // 自定义渲染详情内容
  const renderDetail = (rowData) => (
    <View
      className='mr-2 justify-between items-center flex-row rounded-xl border border-gray-300'
      style={{
        backgroundColor: getColorByType(rowData.type, isDark),
      }}
    >
      <View className='p-4'>
        <Text style={{ fontWeight: '600'}} className='overflow-hidden'>
          {rowData.title}
        </Text>
        <Text className='text-sm text-black mt-1 overflow-hidden'>提交者：{rowData.userName}</Text>
      </View>
    {rowData.type == "progress_report" &&
      <View className='px-4 h-full bg-[#73a273] rounded-r-xl items-center justify-center'>
        <Text className='text-sm text-white font-medium'>
          {rowData.status}
        </Text>
      </View>}
    </View>
  );

  if (isLoading && data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {data.length === 0 ? (
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            color: isDark ? '#ccc' : '#666',
          }}
        >
          暂无进度记录
        </Text>
      ) : (
        <Timeline
          data={data}
          circleSize={20}
          innerCircle={'dot'}
          options={{
            style: { paddingTop: 20, paddingBottom: 20 },
            refreshControl: (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
              />
            ),
            onEndReached: loadMore,
            onEndReachedThreshold: 0.5,
          }}
          timeContainerStyle={{ minWidth: 52, marginTop: -5 }}
          timeStyle={{
            textAlign: 'center',
            backgroundColor: 'transparent',
            color: isDark ? '#bbb' : "#666",
            fontWeight: 500,
            fontSize: 12,
          }}
          descriptionStyle={{ color: isDark ? '#ccc' : '#666' }}
          titleStyle={{ color: isDark ? 'white' : 'black' }}
          renderDetail={renderDetail}
          customLine={(rowData) => (
            <View
              style={{
                height: '100%',
                width: 2,
                backgroundColor: rowData.lineColor,
                marginLeft: 10,
              }}
            />
          )}
          onEventPress={(event) => {
            navigation.navigate("Comment", {
              progress_id: event.progressId,
              role: role
            });
          }}
          listViewContainerStyle={{ paddingTop: 0 }}
        />
      )}

      {hasMore && !isLoading && (
        <View style={{ padding: 10, alignItems: 'center' }}>
          <Text
            onPress={loadMore}
            style={{
              color: isDark ? '#4ea1d3' : '#1a73e8',
            }}
          >
            加载更多...
          </Text>
        </View>
      )}

      {isLoading && data.length > 0 && (
        <View style={{ padding: 10, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}
    </View>
  );
};

export default TimeLine;