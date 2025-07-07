import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Text,
  TextInput,
  StyleSheet,
  Modal
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_INFO } from "../../constant/base";
import ImageViewer from 'react-native-image-zoom-viewer';
import { useToast } from "../../components/tip/ToastHooks";
import { getItemFromAsyncStorage } from "../../utils/LocalStorage";

const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [tags, setTags] = useState([]);
  const { showToast } = useToast();
  const [authToken, setAuthToken] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_INFO.BASE_URL}api/posts/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();

      setPost(data);
      setLikeCount(data.likes_count);

      if (data.tags && data.tags.length > 0) {
        const tagPromises = data.tags.map(tagId =>
          fetch(`${BASE_INFO.BASE_URL}api/tags/${tagId.tag_id}`).then(res => res.json())
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

  const checkLikeStatus = useCallback(async (token) => {
    try {
      const response = await fetch(`${BASE_INFO.BASE_URL}api/posts/${postId}/like/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setLiked(result.liked);
      }
    } catch (err) {
      console.error("Failed to check like status:", err);
    }
  }, [postId]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await getItemFromAsyncStorage("accessToken");
        setAuthToken(token);

        await fetchPost();

        if (token) {
          await checkLikeStatus(token);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [fetchPost, checkLikeStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPost();
      if (authToken) {
        await checkLikeStatus(authToken);
      }
    } finally {
      setRefreshing(false);
    }
  }, [fetchPost, authToken, checkLikeStatus]);

  const toggleLike = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/${liked ? 'unlike' : 'like'}`,
        {
          method: liked ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
        showToast(liked ? "Unliked successfully" : "Liked successfully", "success");
      } else {
        throw new Error(response.statusText);
      }
    } catch (err) {
      showToast("网络遇到问题，请重试", "error");
      console.error('Error toggling like:', err);
    }
  }, [liked, postId, authToken, showToast, navigation]);

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
        <Text className="text-red-500 text-lg">Post does not exist</Text>
      </View>
    );
  }

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
        <Text className="text-red-500 text-lg">Post does not exist</Text>
      </View>
    );
  }

  const images = post.cover_image_url ? [{
    url: post.cover_image_url,
    props: {
    }
  }] : [];

  return (
    <>
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
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {post.title}
          </Text>

          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Image
                source={post.author.avatar_key ? { uri: post.author.avatar_key } : require("../../assets/logo/ava.png")}
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

          {post.cover_image_url && (
            <TouchableOpacity 
              onPress={() => setImageViewerVisible(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: post.cover_image_url }}
                className="w-full h-64 rounded-lg mb-4"
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          <Text className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
            {post.content}
          </Text>

          {tags.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.tag_id}
                  className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2"
                  onPress={() => navigation.navigate('Tag', { id: tag.tag_id })}
                >
                  <Text className="text-sm text-gray-800 dark:text-gray-200">
                    #{tag.tag_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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

        <CommentSection postId={postId} authToken={authToken} />
      </ScrollView>

      <Modal visible={imageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={images}
          enableSwipeDown={true}
          onSwipeDown={() => setImageViewerVisible(false)}
          onClick={() => setImageViewerVisible(false)}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageViewerVisible(false)}
            >
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
});

const CommentSection = ({ postId, authToken }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [commentText, setCommentText] = useState('');
  const { showToast } = useToast();
  const navigation = useNavigation();

  const fetchComments = useCallback(async (pageNum = 0) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/comments?size=10&page=${pageNum}`
      );
      if (!response.ok) throw new Error('Failed to fetch comments');

      const data = await response.json();
      setComments(prev => pageNum === 0 ? data.items : [...prev, ...data.items]);
      setPage(pageNum + 1);
      setHasMore(data.currentPage < data.totalPages);
    } catch (err) {
      console.log('Failed to fetch comments', 'error');
    } finally {
      setLoading(false);
    }
  }, [postId, showToast]);

  const submitComment = useCallback(async () => {
    if (!commentText.trim()) {
      showToast("评论不能为空", "warning");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: commentText,
            parent_comment_id: null
          })
        }
      );

      if (response.ok) {
        setCommentText('');
        showToast("Comment successful", "success");
        fetchComments(0);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit comment');
      }
    } catch (err) {
      console.log(`Comment failed: ${err.message}`, "error");
    }
  }, [postId, authToken, commentText, showToast, navigation, fetchComments]);

  useEffect(() => { fetchComments(0); }, [fetchComments]);

  return (
    <View className="px-4 pb-4 border-t-8 border-gray-100 dark:border-gray-800 pt-4">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">评论</Text>

      <View className="mb-4">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200"
            placeholder="发表一个友善的评论..."
            placeholderTextColor="#9ca3af"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            className="ml-2 bg-blue-500 rounded-full p-2"
            onPress={submitComment}
          >
            <Icon name="send" size={15} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {comments.map(comment => (
        <CommentItem
          key={comment.comment_id}
          comment={comment}
          authToken={authToken}
          postId={postId}
        />
      ))}

      {loading && <LoadingIndicator />}

      {!loading && hasMore && (
        <LoadMoreButton onPress={() => fetchComments(page)} text="加载更多评论" />
      )}
    </View>
  );
};

const CommentItem = ({ comment, authToken, postId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesCurrentPage, setRepliesCurrentPage] = useState(0);
  const [repliesTotalPages, setRepliesTotalPages] = useState(1);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { showToast } = useToast();
  const navigation = useNavigation();

  const fetchReplies = useCallback(async (page = 0) => {
    try {
      setLoadingReplies(true);
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/comments/${comment.comment_id}/replies?size=5&page=${page}`
      );
      if (!response.ok) throw new Error('Failed to fetch replies');

      const data = await response.json();
      setReplies(prev => page === 0 ? data.items : [...prev, ...data.items]);
      setRepliesCurrentPage(data.currentPage);
      setRepliesTotalPages(data.totalPages);
    } catch (err) {
      showToast('无法获取评论', 'error');
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.comment_id, showToast]);

  const submitReply = useCallback(async () => {
    if (!replyText.trim()) {
      showToast("空的回复", "warning");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: replyText,
            parent_comment_id: comment.comment_id
          })
        }
      );

      if (response.ok) {
        setReplyText('');
        setShowReplyInput(false);
        showToast("回复成功", "success");
        fetchReplies(0);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit reply');
      }
    } catch (err) {
      showToast(`Reply failed: ${err.message}`, "error");
    }
  }, [postId, authToken, replyText, comment.comment_id, showToast, navigation, fetchReplies]);

  const toggleReplies = useCallback(() => {
    if (!showReplies && comment.SubReplyCount > 0) {
      fetchReplies(0);
    }
    setShowReplies(prev => !prev);
    setShowReplyInput(false);
  }, [showReplies, comment.SubReplyCount, fetchReplies]);

  const handleReplyButtonPress = useCallback(() => {
    setShowReplyInput(prev => !prev);
    setReplyText('');
    if (!showReplies && comment.SubReplyCount === 0) {
      setShowReplies(true);
    }
  }, [showReplies, comment.SubReplyCount]);

  const loadMoreReplies = useCallback(() => {
    if (repliesCurrentPage < repliesTotalPages - 1) {
      fetchReplies(repliesCurrentPage + 1);
    }
  }, [repliesCurrentPage, repliesTotalPages, fetchReplies]);

  return (
    <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
      <View className="flex-row items-center mb-2">
        <Image
          source={comment.user?.avatar_key ? { uri: comment.user.avatar_key } : require("../../assets/logo/ava.png")}
          className="w-8 h-8 rounded-full mr-2"
        />
        <Text className="font-medium text-gray-900 dark:text-white mr-2">
          {comment.user?.name || 'Anonymous'}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(comment.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text className="text-gray-800 dark:text-gray-200 mb-3">
        {comment.content}
      </Text>

      <View className="flex-row items-center">
        {comment.SubReplyCount > 0 && (
          <TouchableOpacity
            className="flex-row items-center mr-4"
            onPress={toggleReplies}
          >
            <Icon
              name={showReplies ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color="#6b7280"
            />
            <Text className="ml-1 text-gray-600 dark:text-gray-300 text-sm">
              {comment.SubReplyCount} 展开回复
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleReplyButtonPress}
        >
          <Icon
            name="reply"
            size={18}
            color={showReplyInput ? "#3b82f6" : "#6b7280"}
          />
          <Text className={`ml-1 ${showReplyInput ? "text-blue-500" : "text-gray-600 dark:text-gray-300 text-sm"}`}>
            回复
          </Text>
        </TouchableOpacity>
      </View>

      {showReplyInput && (
        <View className="mt-3">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200"
              placeholder={`回复 ${comment.user?.name || '这个评论'}...`}
              placeholderTextColor="#9ca3af"
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <TouchableOpacity
              className="ml-2 bg-blue-500 rounded-full p-2"
              onPress={submitReply}
            >
              <Icon name="send" size={15} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showReplies && (
        <View className="mt-3 ml-4 border-l border-gray-200 dark:border-gray-700 pl-3">
          {loadingReplies && replies.length === 0 ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              {replies.map(reply => (
                <View key={reply.comment_id} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mb-2">
                  <View className="flex-row items-center mb-1">
                    <Image
                      source={reply.user?.avatar_key ? { uri: reply.user.avatar_key } : require("../../assets/logo/ava.png")}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <Text className="font-medium text-gray-900 dark:text-white text-sm mr-2">
                      {reply.user?.name || 'Anonymous'}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(reply.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-gray-800 dark:text-gray-200 text-sm">
                    {reply.content}
                  </Text>
                </View>
              ))}

              {replies.length > 0 && repliesCurrentPage < repliesTotalPages - 1 && (
                <TouchableOpacity
                  className="py-2 rounded-lg flex-row justify-center items-center bg-gray-200 dark:bg-gray-600 mt-2"
                  onPress={loadMoreReplies}
                  disabled={loadingReplies}
                >
                  {loadingReplies ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text className="text-gray-700 dark:text-gray-300">加载更多评论</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const LoadingIndicator = () => (
  <View className="py-4 flex-row justify-center">
    <ActivityIndicator size="small" />
    <Text className="ml-2 text-gray-500 dark:text-gray-400">Loading...</Text>
  </View>
);

const LoadMoreButton = ({ onPress, loading = false, text }) => (
  <TouchableOpacity
    className="py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-row justify-center items-center"
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator size="small" />
    ) : (
      <Text className="text-gray-700 dark:text-gray-300">{text}</Text>
    )}
  </TouchableOpacity>
);

export default PostDetailScreen;