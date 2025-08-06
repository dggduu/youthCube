import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useColorScheme
} from 'react-native';
import { useToast } from '../../components/tip/ToastHooks';
import { getItemFromAsyncStorage } from '../../utils/LocalStorage';
import { BASE_INFO } from '../../constant/base';
import axios from 'axios';
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";
import { WhiteSpace } from '@ant-design/react-native';
import Icon from '@react-native-vector-icons/material-icons';

const api = axios.create();
setupAuthInterceptors(api);

// 颜色色阶：从浅绿到深绿
const GREEN_SHADES = [
  '#e8f5e9', // 最浅
  '#c8e6c9',
  '#a5d6a7',
  '#81c784',
  '#66bb6a',
  '#4caf50',
  '#43a047',
  '#388e3c',
  '#2e7d32',
  '#1b5e20'  // 最深
];

// 格式化日期为 Y-m-d
const date = (timestamp) => {
  const d = new Date(timestamp);
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}`;
};

// 获取过去一年的所有日期
const getDates = () => {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const startDay = new Date(oneYearAgo);
  const dayOfWeek = startDay.getDay();
  startDay.setDate(startDay.getDate() - dayOfWeek);

  const endDay = new Date();
  const daysToAdd = (6 - endDay.getDay() + 7) % 7;
  endDay.setDate(endDay.getDate() + daysToAdd);

  const result = [];
  let currentDate = new Date(startDay);

  while (currentDate <= endDay) {
    result.push(date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

// 计算每个月1号所在的周和列位置
const calculateMonthLabels = (weeks) => {
  const monthLabels = [];
  const seenMonths = new Set();

  weeks.forEach((week, weekIndex) => {
    if (!week.length) return;
    
    // Find the first day of the month in this week
    const firstDayOfMonth = week.find(day => {
      const d = new Date(day);
      return d.getDate() === 1;
    });

    if (firstDayOfMonth) {
      const d = new Date(firstDayOfMonth);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const key = `${year}-${month}`;

      if (!seenMonths.has(key)) {
        seenMonths.add(key);
        monthLabels.push({
          month,
          weekIndex,
        });
      }
    }
  });

  return monthLabels;
};

const getColorByType = (types, isDarkMode, maxCount) => {
  if (!types || types.length === 0) {
    return isDarkMode ? '#777' : '#ebedf0';
  }

  const priority = ['deadline', 'competition', 'meeting', 'progress_report'];
  for (const type of priority) {
    if (types.includes(type)) {
      switch (type) {
        case 'meeting': return '#facc15';
        case 'deadline': return '#ef4444';
        case 'competition': return '#3b82f6';
        case 'progress_report':
          const count = types.filter(t => t === 'progress_report').length;
          if (count === 0) return isDarkMode ? '#1a1a1a' : '#ebedf0';

          const index = Math.min(
            Math.floor((count / maxCount) * (GREEN_SHADES.length - 1)),
            GREEN_SHADES.length - 1
          );
          return GREEN_SHADES[index];
      }
    }
  }

  return isDarkMode ? '#1a1a1a' : '#ebedf0';
};

const useChartStyles = () => {
  return StyleSheet.create({
    legendContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 5,
    },
    legendColor: {
      width: 10,
      height: 10,
      marginRight: 4,
      borderRadius: 2,
    },
    months: {
      height: 16,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    monthLabel: {
      position: 'absolute',
      fontSize: 10,
    },
    days: {
      left: 3,
      width: 16,
      height: '100%',
      zIndex: 1,
      marginTop: 13
    },
    weekDay: {
      position: 'absolute',
      fontSize: 10,
    },
    gridContainer: {
      flexDirection: 'row',
      marginTop: 15,
    },
    weekColumn: {
      marginRight: 3,
    },
    gridItem: {
      width: 12,
      height: 12,
      marginBottom: 3,
      borderRadius: 4,
    },
    todayHighlight: {
      borderWidth: 1,
    },
    scrollView: {
      width: Dimensions.get('window').width - 32,
      marginLeft: 4
    },
    scrollViewContent: {
      paddingRight: 16,
    },
  });
};

const MosciaChart = ({ team_id }) => {
  const [mosaicTile, setMosaicTile] = useState({});
  const [maxCount, setMaxCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { showToast } = useToast();
  const scrollViewRef = useRef(null);
  const days = getDates();
  const today = date(Date.now());

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthLabels = calculateMonthLabels(weeks);
  const styles = useChartStyles();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getItemFromAsyncStorage('accessToken');
        const response = await api.get(`${BASE_INFO.BASE_URL}api/team/${team_id}/progress/year`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = response.data;

        const eventsByDay = {};
        let max = 0;

        if (result.success && Array.isArray(result.data)) {
          result.data.forEach((item) => {
            if (!item.event_time) return;

            const day = date(new Date(item.event_time));
            if (!eventsByDay[day]) eventsByDay[day] = [];

            eventsByDay[day].push(item.timeline_type);

            if (item.timeline_type === 'progress_report') {
              const count = (eventsByDay[day].filter(t => t === 'progress_report') || []).length;
              max = Math.max(max, count);
            }
          });
        }

        setMosaicTile(eventsByDay);
        setMaxCount(max);
      } catch (error) {
        console.error('Error fetching team progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [team_id]);

  useEffect(() => {
    if (!isLoading && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [isLoading]);

  if (isLoading) {
    return <View style={styles.container} />;
  }
  
  if (!team_id) {
    return <WhiteSpace />;
  }

  return (
    <View className="justify-center bg-white dark:bg-gray-700 py-5 px-3 mx-3 rounded-xl items-center border border-gray-300 dark:border-gray-600">
      <View className="flex-row">
        {/* 星期标签 */}
        <View style={styles.days}>
          <Text style={[styles.weekDay, { top: 0 }]} className="text-gray-800 dark:text-gray-300">日</Text>
          <Text style={[styles.weekDay, { top: 15 }]} className="text-gray-800 dark:text-gray-300">一</Text>
          <Text style={[styles.weekDay, { top: 30 }]} className="text-gray-800 dark:text-gray-300">二</Text>
          <Text style={[styles.weekDay, { top: 45 }]} className="text-gray-800 dark:text-gray-300">三</Text>
          <Text style={[styles.weekDay, { top: 60 }]} className="text-gray-800 dark:text-gray-300">四</Text>
          <Text style={[styles.weekDay, { top: 75 }]} className="text-gray-800 dark:text-gray-300">五</Text>
          <Text style={[styles.weekDay, { top: 90 }]} className="text-gray-800 dark:text-gray-300">六</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View>
            {/* 月份标签 */}
            <View style={styles.months}>
              {monthLabels.map((label, index) => (
                <Text
                  key={`${label.month}-${label.weekIndex}`}
                  style={[
                    styles.monthLabel,
                    {
                      left: label.weekIndex * 15 + 2,
                    },
                  ]}
                  className="text-gray-800 dark:text-gray-300"
                >
                  {label.month}月
                </Text>
              ))}
            </View>

            {/* 热力图格子 */}
            <View style={styles.gridContainer}>
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.weekColumn}>
                  {week.map((day, dayIndex) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.gridItem,
                        day === today && [styles.todayHighlight, { borderColor: isDark ? '#fff' : '#333' }],
                        {
                          backgroundColor: getColorByType(mosaicTile[day], isDark, maxCount),
                        },
                      ]}
                      onPress={() => {
                        const count = mosaicTile[day]?.length || 0;
                        showToast(`${day}\n ${count} 个提交`);
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 图例 */}
      <View className="flex-row mt-3 self-center">
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
          <Text className="text-xs text-gray-800 dark:text-gray-300">比赛</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#facc15' }]} />
          <Text className="text-xs text-gray-800 dark:text-gray-300">会议</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#66bb6a' }]} />
          <View style={[styles.legendColor, { backgroundColor: '#81c784' }]} />
          <View style={[styles.legendColor, { backgroundColor: '#43a047' }]} />
          <View style={[styles.legendColor, { backgroundColor: '#1b5e20' }]} />
          <Text className="text-xs text-gray-800 dark:text-gray-300">进度报告</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <Text className="text-xs text-gray-800 dark:text-gray-300">任务点</Text>
        </View>
      </View>
    </View>
  );
};

export default MosciaChart;