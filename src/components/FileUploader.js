import { View, Text, TouchableOpacity, ScrollView, ToastAndroid, Image, Modal, Pressable } from 'react-native';
import React, { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadFile } from '../utils/uploadUtils';
import { useColorScheme } from 'nativewind';
import ImageViewer from 'react-native-image-zoom-viewer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import CustomAlert from '../components/custom/CustomAlert'; // ✅ 引入 CustomAlert

const FileUploader = ({ AccessToken }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // ✅ 新增：控制 CustomAlert 的状态
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  const { colorScheme } = useColorScheme();

  const config = {
    authToken: AccessToken,
    bucketName: 'posts',
  };

  const handleFileUpload = async () => {
    if (uploadedFiles.length >= 5) {
      showToast('最多只能上传5个文件');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        showToast('选择图片时出错');
        console.error(response.errorMessage);
        return;
      }

      try {
        setIsUploading(true);
        const asset = response.assets[0];
        const uri = asset.uri;
        const fileExtension = asset.fileName ? asset.fileName.split('.').pop() : asset.type.split('/')[1];
        const name = asset.fileName || `image_${Date.now()}.${fileExtension}`;
        const type = asset.type;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(type)) {
          showToast('不支持的文件类型。请选择 JPEG, PNG, GIF 或 WEBP 格式。');
          return;
        }

        const uploadConfig = {
          ...config,
          contentType: type,
        };

        const uploadResult = await uploadFile(uri, uploadConfig);

        if (uploadResult.success) {
          const newFile = {
            name,
            url: uploadResult.fileUrl,
            date: new Date().toLocaleString(),
            uri,
            type,
          };
          setUploadedFiles(prev => [...prev, newFile]);
          showToast('图片上传成功');
        } else {
          showToast(`上传失败: ${uploadResult.error}`);
        }
      } catch (err) {
        showToast('上传过程中出错');
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    });
  };

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleImagePress = (index) => {
    setCurrentImageIndex(index);
    setImageViewerVisible(true);
  };

  const handleDeleteImage = (indexToDelete) => {
    setAlertTitle('删除图片');
    setAlertMessage('您确定要从列表中删除此图片吗？');
    setAlertButtons([
      {
        text: '取消',
        style: 'cancel',
        onPress: () => setAlertVisible(false),
      },
      {
        text: '删除',
        style: 'destructive', // 红色按钮
        onPress: () => {
          setAlertVisible(false);
          setUploadedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToDelete));
          showToast('图片已从列表中删除');
        },
      },
    ]);
    setAlertVisible(true);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    showToast('已复制到剪贴板');
  };

  const imagesForViewer = uploadedFiles.map(file => ({
    url: file.url,
    props: {
      source: { uri: file.uri },
    },
  }));

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900">
      {/* 上传按钮 */}
      <TouchableOpacity
        className={`p-4 rounded-lg items-center justify-center mb-4 
          ${isUploading ? 'bg-blue-300' : 'bg-[#409eff]'} 
          ${colorScheme === 'dark' ? 'border border-blue-400' : ''}`}
        onPress={handleFileUpload}
        disabled={isUploading}
      >
        <Text className="text-white font-bold">
          {isUploading ? '上传中...' : '选择图片上传'}
        </Text>
      </TouchableOpacity>

      <Text className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
        - 已上传 {uploadedFiles.length}/5 个图片
      </Text>

      <ScrollView className="flex-1">
        {uploadedFiles.map((file, index) => (
          <View
            key={index}
            className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-gray-800 dark:text-gray-200 font-medium flex-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {file.name}
              </Text>
              <Pressable
                onPress={() => handleDeleteImage(index)}
                className="p-1"
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'}
                />
              </Pressable>
            </View>

            {file.type.startsWith('image/') && (
              <Pressable onPress={() => handleImagePress(index)} className="mb-2">
                <Image
                  source={{ uri: file.uri }}
                  className="w-full h-40 rounded-lg"
                  resizeMode="contain"
                />
              </Pressable>
            )}

            <View className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <Text
                className="text-gray-600 dark:text-gray-300 text-xs flex-1 mr-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {file.url}
              </Text>
              <Pressable onPress={() => copyToClipboard(file.url)} className="p-1">
                <MaterialIcons
                  name="content-copy"
                  size={16}
                  color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
                />
              </Pressable>
            </View>

            <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">
              上传时间: {file.date}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* 图片查看器 */}
      <Modal
        visible={imageViewerVisible}
        transparent={false}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <ImageViewer
          imageUrls={imagesForViewer}
          index={currentImageIndex}
          onCancel={() => setImageViewerVisible(false)}
          enableSwipeDown={true}
          renderHeader={() => (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              padding: 20,
              backgroundColor: 'rgba(0,0,0,0.8)'
            }}>
              <TouchableOpacity onPress={() => setImageViewerVisible(false)} style={{ padding: 10 }}>
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          renderFooter={(currentIndex) => (
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              flexDirection: 'row',
              justifyContent: 'center',
              padding: 20,
              backgroundColor: 'rgba(0,0,0,0.8)'
            }}>
              <Text style={{ color: 'white', fontSize: 16 }}>
                {uploadedFiles[currentIndex]?.name}
              </Text>
            </View>
          )}
        />
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default FileUploader;