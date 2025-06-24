import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';

export default function ProfileScreen({ isDark = false, navigation }) {
  const learningItems = [
    { icon: 'access-time', label: '练习记录', screen: 'LearningNavigtor', params: { screen: 'Pratice' } },
    { icon: 'group', label: '我的班级', screen: 'LearningNavigtor', params: { screen: 'ClassInfo' } },
    { icon: 'assignment', label: '学习周报', screen: 'LearningNavigtor', params: { screen: 'WeeklyReport' } },
    { icon: 'list', label: '错题本', screen: 'LearningNavigtor', params: { screen: 'CorrectBook' } },
    { icon: 'chat', label: '聊天群组', screen: 'LearningNavigtor', params: { screen: 'ChatGroup' } },
    { icon: 'favorite', label: '我的收藏', screen: 'LearningNavigtor', params: { screen: 'Collect' } },
    { icon: 'edit', label: '我的笔记', screen: 'LearningNavigtor', params: { screen: 'Note' } },
    { icon: 'publish', label: '我的投稿', screen: 'LearningNavigtor', params: { screen: 'Uploader' } },
  ];

  const sportsItems = [
    { icon: 'directions-run', label: '开始运动', description: '开始今天的运动', screen: 'SportsStack', params: { screen: 'StartSport' } },
    { icon: 'fitness-center', label: '运动记录', description: '查看运动记录', screen: 'SportsStack', params: { screen: 'Log' } },
    { icon: 'show-chart', label: '传感器数据', description: '查看数据', screen: 'SportsStack', params: { screen: 'SportData' } },
    { icon: 'emoji-events', label: '运动竞赛', description: '和好友一起PK', screen: 'SportsStack', params: { screen: 'PK' } },
  ];

  const otherItems = [
    { icon: 'shopping-cart', label: '我的订单', screen: 'MiscStack', params: { screen: 'Order' } },
    { icon: 'favorite', label: '推荐给好友', screen: 'MiscStack', params: { screen: 'Recommend' } },
    { icon: 'thumb-up', label: '给个好评', screen: 'MiscStack', params: { screen: 'ThumbsUp' } },
    { icon: 'verified-user', label: '资质证照展示', screen: 'MiscStack', params: { screen: 'QualityCheck' } },
  ];

  return (
    <SafeAreaProvider>
      <View style={[styles.container, isDark && styles.darkContainer]}>
        {/* 头部信息 */}
        <View style={styles.headerRow}>
          <View style={styles.userRow}>
            <Image source={{ uri: 'https://s21.ax1x.com/2025/06/19/pVVEzbn.png' }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>写死了</Text>
              <Text style={styles.userSubtext}>小学一年级</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ marginRight: 16 }} onPress={() => navigation.navigate('TopBar', { screen: 'Message' })}>
              <MaterialIcon name="people" size={24} color={isDark ? '#A9A9A9' : '#888'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('TopBar', { screen: 'Setting' })}>
              <MaterialIcon name="settings" size={24} color={isDark ? '#A9A9A9' : '#888'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 我的学习 */}
        <View style={{ backgroundColor: isDark ? '#5D407C80' : '#EDE7F6', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#333' }]}>我的学习</Text>
          <FlatGrid
            itemDimension={80}
            data={learningItems}
            spacing={10}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(item.screen, item.params)}>
                <MaterialIcon name={item.icon} size={24} color={isDark ? '#A9A9A9' : '#888'} />
                <Text style={[styles.iconText, { color: isDark ? '#ccc' : '#666' }]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 我的运动 */}
        <View style={{ backgroundColor: isDark ? '#2E2E4B80' : '#ECEFF1', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ccc' : '#333' }]}>我的运动</Text>
          <FlatGrid
            itemDimension={130}
            data={sportsItems}
            spacing={10}
            fixedItemsPerRow={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.sportsButton, { backgroundColor: isDark ? '#2E2E4B' : '#f0f0f0' }]}
                onPress={() => navigation.navigate(item.screen, item.params)}
              >
                <MaterialIcon name={item.icon} size={24} color={isDark ? '#A9A9A9' : '#888'} />
                <View>
                  <Text style={[styles.sportsText, { color: isDark ? '#ccc' : '#333' }]}>{item.label}</Text>
                  <Text style={[styles.sportsDesc, { color: isDark ? '#aaa' : '#666' }]}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* 其他选项 */}
        <View style={{ backgroundColor: isDark ? '#2E2E4B80' : '#ECEFF1', padding: 16, borderRadius: 12 }}>
          <View style={{ gap: 12 }}>
            {otherItems.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.otherItem} onPress={() => navigation.navigate(item.screen, item.params)}>
                <MaterialIcon name={item.icon} size={22} color={isDark ? '#A9A9A9' : '#888'} />
                <Text style={[styles.otherLabel, { color: isDark ? '#ccc' : '#333' }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: 'black',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginLeft: 8,
    marginTop: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    marginLeft: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userSubtext: {
    fontSize: 14,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 8,
    color: '#333',
  },
  gridItem: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  sportsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  sportsText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  sportsDesc: {
    fontSize: 12,
    marginLeft: 10,
    color: '#666',
  },
  otherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    marginLeft: 8,
  },
  otherLabel: {
    fontSize: 16,
    marginLeft: 20,
    color: '#333',
  },
});