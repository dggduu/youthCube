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
import {  } from "@tanstack/react-query";

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

  // 找到过去一年的第一天是周几，计算从最近的周日开始
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
    const firstDay = new Date(week[0]);
    const month = firstDay.getMonth() + 1;
    const key = `${firstDay.getFullYear()}-${month}`;

    if (!seenMonths.has(key)) {
      seenMonths.add(key);
      monthLabels.push({
        month,
        weekIndex,
      });
    }
  });

  return monthLabels;
};

// 根据 timeline_type 返回颜色
const getColorByType = (types, isDarkMode) => {
  if (!types || types.length === 0) {
    return isDarkMode ? '#1a1a1a' : '#ebedf0';
  }

  const priority = ['deadline', 'competition', 'meeting', 'progress_report'];
  for (const type of priority) {
    if (types.includes(type)) {
      switch (type) {
        case 'meeting': return '#facc15'; // yellow-400
        case 'deadline': return '#ef4444'; // red-500
        case 'competition': return '#3b82f6'; // blue-500
        case 'progress_report': return '#10b981'; // green-500
      }
    }
  }

  return isDarkMode ? '#1a1a1a' : '#ebedf0';
};

// 获取深色/浅色模式样式
const useChartStyles = (isDarkMode) => {
  const colors = {
    bg: isDarkMode ? '#121212' : '#fff',
    itemBg: isDarkMode ? '#1a1a1a' : '#ebedf0',
    todayBorder: isDarkMode ? '#fff' : '#000',
    monthLabel: isDarkMode ? '#ccc' : '#000',
    weekdayLabel: isDarkMode ? '#999' : '#000',
    legendText: isDarkMode ? '#fff' : '#000',
  };

  return StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.bg,
    },
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
    legendText: {
      fontSize: 10,
      color: colors.legendText,
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
      color: colors.monthLabel,
    },
    days: {
      position: 'absolute',
      left: 3,
      width: 16,
      height: '100%',
      zIndex: 1,
      marginTop:20
    },
    weekDay: {
      position: 'absolute',
      fontSize: 10,
      color: colors.weekdayLabel,
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
      borderRadius: 2,
      backgroundColor: colors.itemBg,
    },
    todayHighlight: {
      borderWidth: 1,
      borderColor: colors.todayBorder,
    },
    scrollView: {
      width: Dimensions.get('window').width - 32,
    },
    scrollViewContent: {
      paddingRight: 16,
    },
  });
};

const MosciaChart = ({ team_id }) => {
  const [mosaicTile, setMosaicTile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";
  const { showToast } = useToast();
  const scrollViewRef = useRef(null);

  const days = getDates();
  const today = date(Date.now());

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const monthLabels = calculateMonthLabels(weeks);

  const styles = useChartStyles(isDark);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getItemFromAsyncStorage('accessToken');
        const response = await fetch(`${BASE_INFO.BASE_URL}api/team/${team_id}/progress/year`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();

        const eventsByDay = {};

        if (result.success && Array.isArray(result.data)) {
          result.data.forEach((item) => {
            if (!item.event_time) return;

            const day = date(new Date(item.event_time));
            if (!eventsByDay[day]) eventsByDay[day] = [];

            eventsByDay[day].push(item.timeline_type);
          });
        }

        setMosaicTile(eventsByDay);
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
    return (
      <View style={styles.container}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 星期标签 */}
      <View style={styles.days}>
        <Text style={[styles.weekDay, { top: 0 }]}>日</Text>
        <Text style={[styles.weekDay, { top: 15 }]}>一</Text>
        <Text style={[styles.weekDay, { top: 30 }]}>二</Text>
        <Text style={[styles.weekDay, { top: 45 }]}>三</Text>
        <Text style={[styles.weekDay, { top: 60 }]}>四</Text>
        <Text style={[styles.weekDay, { top: 75 }]}>五</Text>
        <Text style={[styles.weekDay, { top: 90 }]}>六</Text>
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
                      day === today && styles.todayHighlight,
                      {
                        backgroundColor: getColorByType(mosaicTile[day], isDark),
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
      {/* 图例 */}
      <View className='flex-row mt-2'>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#facc15' }]} />
          <Text style={styles.legendText}>会议</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>截止</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>比赛</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>进度报告</Text>
        </View>
      </View>
    </View>
  );
};

export default MosciaChart;