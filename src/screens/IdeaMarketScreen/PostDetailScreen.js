import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Text
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_INFO } from "../../constant/base";

const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  
  // 帖子数据状态
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [tags, setTags] = useState([]);

  // 获取帖子详情
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_INFO.BASE_URL}api/posts/${postId}`);
      const data = await response.json();
      
      setPost(data);
      setLikeCount(data.likes_count);
      
      // 获取标签数据
      if (data.tags && data.tags.length > 0) {
        const tagPromises = data.tags.map(tagId => 
          fetch(`${BASE_INFO.BASE_URL}api/tags/${tagId}`).then(res => res.json())
        );
        const tagData = await Promise.all(tagPromises);
        setTags(tagData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 刷新数据
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPost().finally(() => setRefreshing(false));
  }, [fetchPost]);

  // 点赞/取消点赞
  const toggleLike = useCallback(async () => {
    try {
      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/${liked ? 'unlike' : 'like'}`,
        {
          method,
          headers: {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImVtYWlsIjoiMjY1ODg5NTg2NkBxcS5jb20iLCJpYXQiOjE3NTE1NjQ0MTQsImV4cCI6MTc1MTU3ODgxNH0.El8kUt-80Uim4q2PRzjPRSHHGz-NhiWDTyKUElUAPiA',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  }, [liked, postId]);

  // 初始加载
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">{error}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">帖子不存在</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#3b82f6']}
          tintColor={'#3b82f6'}
        />
      }
    >
      {/* 帖子内容 */}
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {post.title}
        </Text>
        
        {/* 作者信息 */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Image
              source={{ uri: post.author.avatar_key || 'https://via.placeholder.com/50' }}
              className="w-10 h-10 rounded-full mr-2"
            />
            <Text className="text-base font-medium text-gray-900 dark:text-white">
              {post.author.name}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {/* 封面图片 */}
        {post.cover_image_url && (
          <Image
            source={{ uri: post.cover_image_url }}
            className="w-full h-64 rounded-lg mb-4"
            resizeMode="cover"
          />
        )}
        
        {/* 正文内容 */}
        <Text className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
          {post.content}
        </Text>
        
        {/* 标签 */}
        {tags.length > 0 && (
          <View className="flex-row flex-wrap mb-4">
            {tags.map(tag => (
              <TouchableOpacity
                key={tag.tag_id}
                className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2"
                onPress={() => navigation.navigate('Tag', { tagId: tag.tag_id })}
              >
                <Text className="text-sm text-gray-800 dark:text-gray-200">
                  #{tag.tag_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* 互动统计 */}
        <View className="flex-row items-center border-t border-b border-gray-200 dark:border-gray-700 py-3 mb-4">
          <TouchableOpacity 
            className="flex-row items-center mr-6"
            onPress={toggleLike}
          >
            <Icon 
              name={liked ? "favorite" : "favorite-outline"} 
              size={24} 
              color={liked ? "#ef4444" : "#6b7280"} 
            />
            <Text className="ml-1 text-gray-600 dark:text-gray-300">
              {likeCount}
            </Text>
          </TouchableOpacity>
          
          <View className="flex-row items-center mr-6">
            <Icon name="chat-bubble-outline" size={20} color="#6b7280" />
            <Text className="ml-1 text-gray-600 dark:text-gray-300">
              {post.comments_count}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Icon name="visibility" size={20} color="#6b7280" />
            <Text className="ml-1 text-gray-600 dark:text-gray-300">
              {post.views_count}
            </Text>
          </View>
        </View>
      </View>
      
      {/* 评论部分 */}
      <CommentSection postId={postId} />
    </ScrollView>
  );
};

// 评论组件
const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const fetchComments = useCallback(async (pageNum = 0) => {
    if (loading || !hasMore) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/comments?size=5&page=${pageNum}`
      );
      const data = await response.json();
      
      setComments(prev => pageNum === 0 ? data.items : [...prev, ...data.items]);
      setPage(pageNum + 1);
      setHasMore(pageNum < data.totalPages - 1);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, loading, hasMore]);

  // 加载更多评论
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchComments(page);
    }
  }, [page, fetchComments, loading, hasMore]);

  // 初始加载
  useEffect(() => {
    fetchComments(0);
  }, [fetchComments]);

  return (
    <View className="px-4 pb-4 border-t-8 border-gray-100 dark:border-gray-800">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        评论
      </Text>
      
      {comments.map(comment => (
        <CommentItem key={comment.comment_id} comment={comment} />
      ))}
      
      {loading && (
        <View className="py-4 flex-row justify-center">
          <ActivityIndicator size="small" />
          <Text className="ml-2 text-gray-500 dark:text-gray-400">加载中...</Text>
        </View>
      )}
      
      {!loading && hasMore && (
        <TouchableOpacity
          className="py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-row justify-center items-center"
          onPress={loadMore}
        >
          <Text className="text-gray-700 dark:text-gray-300">加载更多评论</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// 评论项组件
const CommentItem = ({ comment }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  
  const fetchReplies = useCallback(async () => {
    if (replies.length > 0 || loadingReplies) return;
    
    try {
      setLoadingReplies(true);
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/comments/${comment.comment_id}/replies?size=3&page=0`
      );
      const data = await response.json();
      setReplies(data.items);
    } catch (err) {
      console.error('Error fetching replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.comment_id, replies.length, loadingReplies]);

  const toggleReplies = useCallback(() => {
    if (!showReplies && comment.replies && comment.replies.length > 0) {
      setReplies(comment.replies);
    } else if (!showReplies) {
      fetchReplies();
    }
    setShowReplies(!showReplies);
  }, [showReplies, comment.replies, fetchReplies]);

  return (
    <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
      {/* 评论头部 */}
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: comment.user.avatar_key || 'https://via.placeholder.com/50' }}
          className="w-8 h-8 rounded-full mr-2"
        />
        <Text className="font-medium text-gray-900 dark:text-white mr-2">
          {comment.user.name}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(comment.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      {/* 评论内容 */}
      <Text className="text-gray-800 dark:text-gray-200 mb-3">
        {comment.content}
      </Text>
      
      {/* 评论操作 */}
      <View className="flex-row">
        <TouchableOpacity 
          className="flex-row items-center mr-4"
          onPress={toggleReplies}
        >
          <Icon 
            name={showReplies ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={20} 
            color="#6b7280" 
          />
          <Text className="ml-1 text-gray-600 dark:text-gray-300">
            {comment.replies?.length || 0} 条回复
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center">
          <Icon name="reply" size={18} color="#6b7280" />
          <Text className="ml-1 text-gray-600 dark:text-gray-300">
            回复
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 回复列表 */}
      {showReplies && (
        <View className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
          {loadingReplies ? (
            <ActivityIndicator size="small" />
          ) : (
            replies.map(reply => (
              <View key={reply.comment_id} className="mb-3">
                <View className="flex-row items-center mb-1">
                  <Image
                    source={{ uri: reply.user.avatar_key || 'https://via.placeholder.com/50' }}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <Text className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                    {reply.user.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-sm text-gray-700 dark:text-gray-300">
                  {reply.content}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
};

export default PostDetailScreen;