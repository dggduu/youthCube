import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { uploadFile } from "../utils/uploadUtils";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';
import RNFetchBlob from 'rn-fetch-blob';

const AttachmentUploader = ({ AccessToken, fileUrl, setFileUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const { colorScheme } = useColorScheme();

  const config = {
    authToken: AccessToken,
    bucketName: 'files',
  };

  // 100MB in bytes
  const MAX_FILE_SIZE = 150 * 1024 * 1024;

  const handleFileUpload = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.zip,
          DocumentPicker.types.pdf,
          DocumentPicker.types.allFiles,
        ],
      });

      const file = res[0];
      const fileSize = file.size || (await RNFetchBlob.fs.stat(file.uri)).size;

      // Check file size
      if (fileSize > MAX_FILE_SIZE) {
        showToast('文件大小不能超过100MB');
        return;
      }

      // Check file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['7z', 'zip', 'pdf'];
      if (!allowedExtensions.includes(fileExtension)) {
        showToast('仅支持 7z, zip, pdf 格式的文件');
        return;
      }

      setIsUploading(true);
      setFileName(file.name);

      const uploadConfig = {
        ...config,
        contentType: file.type || 'application/octet-stream',
      };

      const uploadResult = await uploadFile(file.uri, uploadConfig);

      if (uploadResult.success) {
        setFileUrl(uploadResult.fileUrl);
        showToast('文件上传成功');
      } else {
        showToast(`上传失败: ${uploadResult.error}`);
        setFileName('');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        showToast('选择文件时出错');
        console.error(err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const showToast = (message) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const handleRemoveFile = () => {
    Alert.alert(
      "删除文件",
      "您确定要删除当前文件吗？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "删除",
          onPress: () => {
            setFileUrl('');
            setFileName('');
            showToast('文件已删除');
          }
        }
      ]
    );
  };

  const getFileIcon = (name) => {
    if (!name) return 'insert-drive-file';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'picture-as-pdf';
    if (ext === 'zip' || ext === '7z') return 'folder-zip';
    return 'insert-drive-file';
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 mb-2 text-sm">文件上传 (仅支持7z, zip, pdf格式，最大100MB)</Text>
      
      {fileUrl ? (
        <View className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
          <View className="flex-row items-center flex-1">
            <MaterialIcons 
              name={getFileIcon(fileName)} 
              size={24} 
              color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
              className="mr-3"
            />
            <Text 
              className="text-gray-800 dark:text-gray-200 flex-1" 
              numberOfLines={1} 
              ellipsizeMode="middle"
            >
              {fileName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRemoveFile}
            className="ml-2"
          >
            <MaterialIcons 
              name="close" 
              size={20} 
              color={colorScheme === 'dark' ? '#e5e7eb' : '#6b7280'} 
            />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className={`p-4 rounded-lg items-center justify-center 
            ${isUploading ? 'bg-blue-300' : 'bg-[#409eff]'} 
            ${colorScheme === 'dark' ? 'border border-blue-400' : ''}`}
          onPress={handleFileUpload}
          disabled={isUploading}
        >
          <View className="flex-row items-center">
            <MaterialIcons 
              name="cloud-upload" 
              size={20} 
              color="white"
              className="mr-2"
            />
            <Text className="text-white font-bold">
              {isUploading ? '上传中...' : '选择文件上传'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AttachmentUploader;