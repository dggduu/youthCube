import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
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
  Modal,
  useColorScheme,
  KeyboardAvoidingView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_INFO } from "../../constant/base";
import ImageViewer from 'react-native-image-zoom-viewer';
import { useToast } from "../../components/tip/ToastHooks";
import { getItemFromAsyncStorage } from "../../utils/LocalStorage";
import Markdown from "react-native-marked";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { navigate } from "../../navigation/NavigatorRef";
import { KeyboardAvoidingScrollView } from "react-native-keyboard-avoiding-scroll-view";
import axios from 'axios'
import setupAuthInterceptors from "../../utils/axios/AuthInterceptors";
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
const api = axios.create();
setupAuthInterceptors(api);

const PostDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme == "dark";

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [collected, setCollected] = useState(false);
  const [collectCount, setCollectCount] = useState(0);
  const [tags, setTags] = useState([]);
  const { showToast } = useToast();
  const [authToken, setAuthToken] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFileUri, setDownloadedFileUri] = useState(null);

  const handleDownload = useCallback(async (mediaUrl) => {
    if (!mediaUrl) return;
    
    try {
      setDownloading(true);
      setDownloadProgress(0);
      
      const fileName = mediaUrl.split('/').pop();
      const downloadDest = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      const options = {
        fromUrl: mediaUrl,
        toFile: downloadDest,
        background: true,
        begin: (res) => {
          console.log('Download began:', res);
        },
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength);
          setDownloadProgress(progress);
        },
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`,
        } : {},
      };
      
      const download = await RNFS.downloadFile(options).promise;
      
      if (download.statusCode === 200) {
        setDownloadedFileUri(downloadDest);
        showToast("下载完成", "success");
      } else {
        throw new Error(`Download failed with status ${download.statusCode}`);
      }
    } catch (err) {
      console.error('Download error:', err);
      showToast("下载失败", "error");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  }, [authToken, showToast]);

  const handleOpenFile = useCallback(async () => {
    if (!downloadedFileUri) return;
    
    try {
      const fileExists = await RNFS.exists(downloadedFileUri);
      if (!fileExists) {
        throw new Error('File not found');
      }
      
      await FileViewer.open(downloadedFileUri, { 
        showOpenWithDialog: true,
        onDismiss: () => console.log('File viewer dismissed') 
      });
    } catch (err) {
      console.error('Error opening file:', err);
      showToast("无法打开文件", "error");
      
      try {
        if (Platform.OS === 'android') {
          await Linking.openURL(`file://${downloadedFileUri}`);
        } else {
          await Linking.openURL(downloadedFileUri);
        }
      } catch (linkErr) {
        console.error('Error opening with Linking:', linkErr);
      }
    }
  }, [downloadedFileUri, showToast]);

  useEffect(() => {
    const checkExistingFile = async () => {
      if (post?.media?.[0]?.media_url) {
        const fileName = post.media[0].media_url.split('/').pop();
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
          setDownloadedFileUri(filePath);
        }
      }
    };
    
    checkExistingFile();
  }, [post]);

  // 处理生成嵌套问题，但嵌套深度为复数个时显示跳转主页按钮
  const state = navigation.getState();
  const index = state.routes.findIndex(r => r.key === route.key);
  const depth = state.routes.length - index - 1;
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => navigate('MainTabNavigator', { screen: '学习中心'})}
            style={{ marginRight: 10 }}
          >
            <MaterialIcons name="home" size={24} color={isDark ? "#eee" : "333"} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [depth, navigation, route.params?.team_id]);
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`${BASE_INFO.BASE_URL}api/posts/${postId}`);
      const data = response.data;
      console.log("postData",data);
      setPost(data);
      setLikeCount(data.likes_count);

      if (data.tags && data.tags.length > 0) {
        const tagPromises = data.tags.map(tagId =>
          axios.get(`${BASE_INFO.BASE_URL}api/tags/${tagId.tag_id}`)
        );
        const tagResponses = await Promise.all(tagPromises);
        const tagData = tagResponses.map(res => res.data);
        setTags(tagData);
      }
    } catch (err) {
      let errorMessage = '加载帖子失败';

      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = '网络错误，请检查您的连接';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const checkLikeStatus = useCallback(async (token) => {
    try {
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/like/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setLiked(response.data.liked);
    } catch (err) {
      console.error("Failed to check like status:", err);
    }
  }, [postId]);

  const checkCollectStatus = useCallback(async (token) => {
    try {
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/collect/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setCollected(response.data.collected);
      setCollectCount(response.data.collectedCount);
    } catch (err) {
      console.error("Failed to check collect status:", err);
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
          await checkCollectStatus(token);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [fetchPost, checkLikeStatus, checkCollectStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchPost();
      if (authToken) {
        await checkLikeStatus(authToken);
        await checkCollectStatus(authToken);
      }
    } finally {
      setRefreshing(false);
    }
  }, [fetchPost, authToken, checkLikeStatus, checkCollectStatus]);

  const toggleLike = useCallback(async () => {
    try {
      const method = liked ? 'DELETE' : 'POST';
      const url = `${BASE_INFO.BASE_URL}api/posts/${postId}/${liked ? 'unlike' : 'like'}`;

      await api(url, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      showToast(liked ? "取消点赞成功" : "点赞成功", "success");
    } catch (err) {
      showToast("网络遇到问题，请重试", "error");
      console.error('Error toggling like:', err);
    }
  }, [liked, postId, authToken, showToast]);

  const toggleCollect = useCallback(async () => {
    try {
      const method = collected ? 'DELETE' : 'POST';
      const url = `${BASE_INFO.BASE_URL}api/posts/${postId}/${collected ? 'uncollect' : 'collect'}`;

      await api(url, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      setCollected(!collected);
      setCollectCount(prev => collected ? prev - 1 : prev + 1);
      showToast(collected ? "取消收藏成功" : "收藏成功", "success");
    } catch (err) {
      showToast("网络遇到问题，请重试", "error");
      console.error('Error toggling collect:', err);
    }
  }, [collected, postId, authToken, showToast]);

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
        <Text className="text-[#f56c6c] text-lg">{error}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-[#f56c6c] text-lg">Post does not exist</Text>
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
      <KeyboardAvoidingScrollView
        style={{flex:1}}
        className="bg-white dark:bg-gray-900"
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
          <Text
            style={{
              fontFamily:"NotoSerifSC"
            }} 
            className="text-3xl text-gray-900 dark:text-white mb-3">
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

        {post?.media?.length > 0 && (
            <View className="mb-4">
              {post.media.map((media) => {
                const fileName = media.media_url.split('/').pop();
                const isDownloaded = !!downloadedFileUri;
                
                return (
                  <View key={media.media_id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Icon 
                        name="insert-drive-file" 
                        size={24} 
                        color={isDark ? "#9CA3AF" : "#6B7280"} 
                        style={{ marginRight: 8 }}
                      />
                      <Text 
                        className="text-gray-800 dark:text-gray-200"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {fileName}
                      </Text>
                    </View>
                    
                    {isDownloaded ? (
                      <TouchableOpacity
                        onPress={handleOpenFile}
                        className="bg-[#409eff] px-4 py-2 rounded-full"
                      >
                        <Text className="text-white">打开</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleDownload(media.media_url)}
                        disabled={downloading}
                        className="bg-[#409eff] px-3 py-1 rounded-full min-w-[70px] items-center"
                      >
                        {downloading ? (
                          <View className="flex-row items-center">
                            <ActivityIndicator 
                              color="white" 
                              size="small" 
                              style={{ marginRight: 4 }}
                            />
                            <Text className="text-white">
                              {Math.round(downloadProgress * 100)}%
                            </Text>
                          </View>
                        ) : (
                          <Text className="text-white">下载</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <Markdown
            value={post.content}
            flatListProps={{
              initialNumToRender: 8,
              scrollEnabled: false
            }} 
          />

          {tags.length > 0 && (
            <View className="flex-row flex-wrap mb-4 mt-2">
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag.tag_id}
                  className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full mr-2 mb-2 border border-blue-100 dark:border-blue-800 flex-row items-center"
                  onPress={() => navigation.navigate('Tag', { id: tag.tag_id })}
                >
                  <Text className="text-blue-600 dark:text-blue-300 text-sm font-medium">
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

            <TouchableOpacity
              className="flex-row items-center mr-6"
              onPress={toggleCollect}
            >
              <Icon
                name={collected ? "bookmark" : "bookmark-border"}
                size={24}
                color={collected ? "#3b82f6" : "#6b7280"}
              />
              <Text className="ml-1 text-gray-600 dark:text-gray-300">
                {collectCount}
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
      </KeyboardAvoidingScrollView>

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
      console.log("post_Comment:", data);
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
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/comments`,
        {
          content: commentText,
          parent_comment_id: null
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setCommentText('');
      showToast("评论成功", "success");
      fetchComments(0);

    } catch (err) {
      let errorMessage = '提交失败，请稍后重试';

      if (err.response) {
        try {
          errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        } catch (e) {
          errorMessage = err.response.statusText || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "网络连接失败，请检查网络";
      } else {
        errorMessage = "请求异常";
      }

      showToast(errorMessage, "error");
    }
  }, [postId, authToken, commentText, showToast, fetchComments]);

  useEffect(() => { fetchComments(0); }, [fetchComments]);

  return (
    <View className="px-4 pb-2 border-t-8 border-gray-100 dark:border-gray-800 pt-4">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">评论</Text>

      <View className="mb-4">
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200"
            placeholder="发表一个友善的评论..."
            placeholderTextColor="#9ca3af"
            style={{height:40}}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            className="ml-2 bg-[#409eff] rounded-full p-2"
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
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/posts/${postId}/comments`,
        {
          content: replyText,
          parent_comment_id: comment.comment_id
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setReplyText('');
      setShowReplyInput(false);
      showToast("回复成功", "success");
      fetchReplies(0);

    } catch (err) {
      let errorMessage = '提交失败，请稍后重试';

      if (err.response) {
        try {
          errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        } catch (e) {
          errorMessage = err.response.statusText || errorMessage;
        }
      } else if (err.request) {
        errorMessage = "网络连接失败，请检查网络";
      } else {
        errorMessage = "请求异常";
      }

      showToast(errorMessage, "error");
    }
  }, [
    postId,
    authToken,
    replyText,
    comment.comment_id, // 确保 comment.comment_id 是稳定值或依赖正确
    showToast,
    fetchReplies
  ]);

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
          {comment.user?.name || '匿名用户'}
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
          <Text className={`ml-1 ${showReplyInput ? "text-[#409eff]" : "text-gray-600 dark:text-gray-300 text-sm"}`}>
            回复
          </Text>
        </TouchableOpacity>
      </View>

      {showReplyInput && (
        <View className="mt-3">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200"
              placeholder={`回复 ${comment.user?.name || '这个评论'}...`}
              placeholderTextColor="#9ca3af"
              value={replyText}
              onChangeText={setReplyText}
              style={{height:40}}
              multiline
            />
            <TouchableOpacity
              className="ml-2 bg-[#409eff] rounded-full p-2"
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
                <View key={reply.comment_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mb-2">
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
    className="py-2 bg-gray-300 dark:bg-gray-700 rounded-lg flex-row justify-center items-center"
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