import { View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, FlatList, RefreshControl, ScrollView,useColorScheme,KeyboardAvoidingView } from 'react-native'
import React, { useState, useCallback, useEffect } from 'react'
import { useRoute } from "@react-navigation/native";
import { getItemFromAsyncStorage } from "../../../utils/LocalStorage";
import { BASE_INFO } from "../../../constant/base";
import { useToast } from "../../../components/tip/ToastHooks";
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from "axios";
import Markdown from "react-native-marked";

import setupAuthInterceptors from "../../../utils/axios/AuthInterceptors";
const api = axios.create();
setupAuthInterceptors(api);

const CommentItem = ({ comment, authToken, progressId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesCurrentPage, setRepliesCurrentPage] = useState(0);
  const [repliesTotalPages, setRepliesTotalPages] = useState(1);
  const [replyText, setReplyText] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { showToast } = useToast();
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (comment.reply_count > 0 && !initialLoadDone) {
      fetchReplies(0);
      setInitialLoadDone(true);
    }
  }, [comment.reply_count, initialLoadDone]);

  const fetchReplies = useCallback(async (page = 0) => {
    try {
      setLoadingReplies(true);
      const response = await api.get(
        `${BASE_INFO.BASE_URL}api/progress/comments/${comment.comment_id}/replies`,
        {
          params: {
            page,
            size: 5
          }
        }
      );

      const data = response.data;
      setReplies(prev => page === 0 ? data.items : [...prev, ...data.items]);
      setRepliesCurrentPage(data.currentPage || 0);
      setRepliesTotalPages(data.totalPages || 1);
    } catch (err) {
      showToast('无法获取回复', 'error');
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.comment_id, showToast]);

  const submitReply = useCallback(async () => {
    if (!replyText.trim()) {
      showToast("回复内容不能为空", "warning");
      return;
    }

    try {
      const response = await api.post(
        `${BASE_INFO.BASE_URL}api/progress/${progressId}/comments`,
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

      // 直接添加到本地状态，避免重新获取
      const newReply = response.data;
      setReplies(prev => [newReply, ...prev]);
      setReplyText('');
      setShowReplyInput(false);
      showToast("回复成功", "success");

    } catch (err) {
      let errorMessage = '回复失败';
      if (err.response && err.response.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = '网络错误，请检查您的连接';
      } else {
        errorMessage = err.message;
      }
      showToast(`回复失败: ${errorMessage}`, "error");
    }
  }, [progressId, authToken, replyText, comment.comment_id, showToast]);

  const toggleReplies = useCallback(() => {
    if (!showReplies && replies.length === 0 && !loadingReplies) {
      fetchReplies(0);
    }
    setShowReplies(prev => !prev);
    setShowReplyInput(false);
  }, [showReplies, fetchReplies, replies.length, loadingReplies]);

  const handleReplyButtonPress = useCallback(() => {
    setShowReplyInput(prev => !prev);
    setReplyText('');
    if (!showReplies && comment.reply_count > 0) {
      setShowReplies(true);
    }
  }, [showReplies, comment.reply_count]);

  const loadMoreReplies = useCallback(() => {
    if (repliesCurrentPage < repliesTotalPages - 1) {
      fetchReplies(repliesCurrentPage + 1);
    }
  }, [repliesCurrentPage, repliesTotalPages, fetchReplies]);

  return (
    <KeyboardAvoidingView>
      <View className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
        <View className="flex-row items-center mb-2">
          <Image
            source={comment.author?.avatar_key ? { uri: comment.author.avatar_key } : require("../../../assets/logo/ava.png")}
            className="w-8 h-8 rounded-full mr-2"
          />
          <Text className="font-medium text-gray-900 dark:text-white mr-2">
            {comment.author?.name || '匿名用户'}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(comment.created_at).toLocaleDateString()}
          </Text>
        </View>

        <Text className="text-gray-800 dark:text-gray-200 mb-3">
          {comment.content}
        </Text>

        <View className="flex-row items-center">
          {replies.length > 0 && (
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
                {replies.length} 条回复
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
                placeholder={`回复 ${comment.author?.name || '这个评论'}...`}
                placeholderTextColor="#9ca3af"
                value={replyText}
                onChangeText={setReplyText}
                style={{height:40}}
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
                        source={reply.author?.avatar_key ? { uri: reply.author.avatar_key } : require("../../../assets/logo/ava.png")}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <Text className="font-medium text-gray-900 dark:text-white text-sm mr-2">
                        {reply.author?.name || '匿名用户'}
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
                      <Text className="text-gray-700 dark:text-gray-300">加载更多回复</Text>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>

  );
};

const ProgressComment = () => {
  const route = useRoute();
  const { showToast } = useToast();
  const { progress_id } = route.params;
  const [authToken, setAuthToken] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [commentText, setCommentText] = useState("");
  const [progressData, setProgressData] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(true);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const mdStyle = {
    body: {
      fontSize: 12,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    heading1: {
      fontWeight: 800,
      padding: 5,
    },
    heading2: {
      fontWeight:700,
      margin: 5,
    },
    heading3: {
      fontWeight:600,
      margin: 5,
    },
    code: { // 内联代码样式
        backgroundColor: isDark ? '#333333' : '#F5F5F5',
        padding: 2,
        borderRadius: 3,
        color: isDark ? '#FFFFFF' : '#000000',
      },
      codeBlock: { // 代码块样式
        backgroundColor: isDark ? '#2E2E2E' : '#F9F9F9',
        padding: 10,
        borderRadius: 5,
        overflow: 'hidden',
        magrin: 10,
      },
      fence: { // 特定于 fenced code blocks 的样式
        backgroundColor: isDark ? '#2E2E2E' : '#F9F9F9',
        magrin: 10,
      },
      list_item: {
        color: isDark ? '#E6E6E6' : '#1A1A1A',
      },
      unordered_list_icon: {
        color: isDark ? '#FF9800' : '#F57C00', // 修改圆点颜色
      },
      ordered_list_icon: {
        color: isDark ? '#4CAF50' : '#388E3C', // 编号颜色
      },
  };

  const fetchProgressData = useCallback(async (token) => {
    try {
      setLoadingProgress(true);
      const response = await fetch(`${BASE_INFO.BASE_URL}api/progress/${progress_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch progress");
      const data = await response.json();
      setProgressData(data.progress);
    } catch (err) {
      showToast("无法获取进度内容", "error");
    } finally {
      setLoadingProgress(false);
    }
  }, [progress_id, showToast]);

  const fetchComments = useCallback(
    async (page = 0, token = authToken) => {
      try {
        setLoading(page === 0);
        const response = await api.get(
          `${BASE_INFO.BASE_URL}api/progress/${progress_id}/comments?size=10&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        setComments((prev) => (page === 0 ? data.items : [...prev, ...data.items]));
        setCurrentPage(data.currentPage || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        showToast("无法获取评论", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [progress_id, authToken, showToast]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = await getItemFromAsyncStorage("accessToken");
        setAuthToken(token);
        await Promise.all([fetchProgressData(token), fetchComments(0, token)]);
      } catch (err) {
        showToast("初始化数据失败", "error");
      }
    };

    loadInitialData();
  }, [fetchProgressData, fetchComments, showToast]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchComments(0);
  }, [fetchComments]);

const submitComment = useCallback(async () => {
  if (!commentText.trim()) {
    showToast("评论内容不能为空", "warning");
    return;
  }

  try {
    const response = await api.post(
      `${BASE_INFO.BASE_URL}api/progress/${progress_id}/comments`,
      {
        content: commentText,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        }
      }
    );
    setCommentText('');
    showToast("评论成功", "success"); 

  } catch (err) {
    let errorMessage = '评论失败';

    if (err.response) {
      errorMessage = err.response.data?.message || err.response.data?.error || err.response.statusText || errorMessage;
    } else if (err.request) {
      errorMessage = '网络错误，请检查您的连接';
    } else {
      errorMessage = err.message || errorMessage;
    }
    showToast(errorMessage, "error");
  }
}, [progress_id, authToken, commentText, showToast, fetchComments]);

  const loadMoreComments = useCallback(() => {
    if (!loading && currentPage < totalPages - 1) {
      fetchComments(currentPage + 1);
    }
  }, [loading, currentPage, totalPages, fetchComments]);

  const renderProgressHeader = () => {
    if (loadingProgress) {
      return <ActivityIndicator size="small" style={{ marginVertical: 16 }} />;
    }

    if (!progressData) {
      return (
        <Text style={{ textAlign: "center", color: "#999", marginVertical: 16 }}>
          无法加载进度内容
        </Text>
      );
    }

    return (
      <View className='bg-white rounded-xl dark:bg-black p-6 border border-gray-200 dark:border-gray-600 mb-3 mt-4'>
      <Text className='font-semibold text-2xl text-black dark:text-gray-300 mb-4 mt-2' style={{fontFamily:"NotoSerifSC"}}>{progressData.title || "未填写标题"}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Image
            source={
              progressData.submitter?.avatar_key
                ? { uri: progressData.submitter.avatar_key }
                : require("../../../assets/logo/ava.png")
            }
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
          />
          <View>
            <Text style={{ fontWeight: "bold" }} className='dark:text-gray-300'>
              {progressData.submitter?.name || "匿名用户"}
            </Text>
            <Text style={{ fontSize: 12, color: "#999" }}>
              {new Date(progressData.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View>
          <Markdown
            value={progressData.content}
            flatListProps={{
              initialNumToRender: 8,
            }}
          />
        </View>

        {progressData.event_time && (
          <Text style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
            时间: {new Date(progressData.event_time).toLocaleString()}
          </Text>
        )}
      </View>
    );
  };

  const renderCommentInput = () => (
    <View style={{ marginBottom: 12 }} className='mt-4'>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: isDark? "#444":"#fff",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            height:40,
            color: isDark? "#fff" : "#333",
          }}
          placeholder="写下你的评论..."
          placeholderTextColor="#9ca3af"
          value={commentText}
          onChangeText={setCommentText}
          multiline
          onSubmitEditing={submitComment}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={{
            marginLeft: 8,
            backgroundColor: "#3b82f6",
            borderRadius: 999,
            padding: 6,
          }}
          onPress={submitComment}
          disabled={!commentText.trim()}
        >
          <Icon name="send" size={15} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <Text style={{ textAlign: "center", color: "#999", marginTop: 16 }}>
      {loading ? "加载中..." : "暂无评论"}
    </Text>
  );

  const renderFooter = () => {
    if (currentPage >= totalPages - 1) return null;
    return <ActivityIndicator size="small" style={{ marginVertical: 8 }} />;
  };

  return (
    <KeyboardAvoidingView className='flex-1'>
    <ScrollView
      className='flex-1 bg-gray-100 dark:bg-gray-900 px-3'
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#3b82f6"]} />
      }
    >
      {renderProgressHeader()}
      {renderCommentInput()}

      {comments.length > 0 ? (
        comments.map((item) => (
          <CommentItem key={item.comment_id} comment={item} authToken={authToken} progressId={progress_id} />
        ))
      ) : (
        renderEmptyComponent()
      )}

      {renderFooter()}

    </ScrollView>
    </KeyboardAvoidingView>

  );
};

export default React.memo(ProgressComment);