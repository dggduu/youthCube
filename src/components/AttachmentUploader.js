import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid } from 'react-native';
import { pick } from '@react-native-documents/picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';
import RNFetchBlob from 'rn-fetch-blob';
import { uploadFile } from "../utils/uploadUtils";
import { useToast } from "../components/tip/ToastHooks";
import RNFS from 'react-native-fs';
import { sanitizeFileName } from "../utils/utils";
import CustomAlert from "../components/custom/CustomAlert";

const AttachmentUploader = ({ AccessToken, fileUrl, setFileUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const { colorScheme } = useColorScheme();
  const { showToast } = useToast();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  const config = {
    authToken: AccessToken,
    bucketName: 'posts',
  };

  const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB

  const handleFileUpload = async () => {
    try {
      const [file] = await pick({
        types: ['application/zip', 'application/x-7z-compressed', 'text/plain', '*/*'],
        allowMultiSelection: false,
        mode: 'open',
      });

      if (!file || !file.uri) return;

      const fileSize = file.size;
      if (typeof fileSize !== 'number' || isNaN(fileSize)) {
        showToast('无法获取文件大小', "warning");
        return;
      }

      if (fileSize > MAX_FILE_SIZE) {
        showToast('文件大小不能超过150MB', "warning");
        return;
      }

      const rawName = file.name || file.uri.split('/').pop() || 'unknown';
      const rawType = file.type || 'application/octet-stream';
      const ext = rawName.includes('.') ? rawName.split('.').pop()?.toLowerCase() : '';
      const allowedExtensions = ['7z', 'zip'];

      const isMimeAcceptable = [
        'application/zip',
        'application/x-7z-compressed'
      ].includes(rawType);

      const isExtAcceptable = allowedExtensions.includes(ext);

      if (!isMimeAcceptable && !isExtAcceptable) {
        showToast('仅支持 7z, zip 格式的文件', 'warning');
        return;
      }

      const safeName = sanitizeFileName(rawName, ext || rawType.split('/').pop() || '');

      // 显示自定义弹窗
      setAlertTitle('确认上传');
      setAlertMessage(`您确定要上传 ${safeName} 吗?`);
      setAlertButtons([
        { text: '取消', style: 'cancel', onPress: () => setAlertVisible(false) },
        {
          text: '确认',
          style: 'default',
          onPress: async () => {
            setAlertVisible(false);
            await startFileUpload({
              uri: file.uri,
              name: safeName,
              type: rawType,
              size: fileSize
            });
          },
        },
      ]);
      setAlertVisible(true);
    } catch (err) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        showToast('选择文件时出错', "error");
        console.error(err);
      }
    }
  };

  const getMimeTypeByExtension = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'zip': return 'application/zip';
      case '7z': return 'application/x-7z-compressed';
      default: return 'application/octet-stream';
    }
  };

  const startFileUpload = async (file) => {
    let tempFilePath = null;

    try {
      setIsUploading(true);
      setFileName(file.name);

      const ext = file.name.split('.').pop().toLowerCase();
      const mimeType = (file.type && file.type !== 'application/octet-stream')
        ? file.type
        : getMimeTypeByExtension(file.name);
      setFileType(mimeType);

      let finalUri = file.uri;
      if (!finalUri.startsWith('file://')) {
        finalUri = `file://${finalUri}`;
      }

      const uploadConfig = {
        ...config,
        contentType: mimeType,
        fileName: file.name,
      };

      if (file.uri.startsWith('content://')) {
        const destPath = `${RNFS.CachesDirectoryPath}/upload_${Date.now()}.${ext}`;
        await RNFS.copyFile(file.uri, destPath);
        finalUri = `file://${destPath}`;
        tempFilePath = destPath;
      }

      console.log(uploadConfig, "upload");
      const uploadResult = await uploadFile(finalUri, uploadConfig);

      if (uploadResult.success) {
        setFileUrl({
          url: uploadResult.fileUrl,
          name: file.name,
          type: mimeType
        });
        showToast('文件上传成功', "success");
      } else {
        showToast(`上传失败`, "error");
      }
    } catch (error) {
      showToast('上传失败', "error");
      console.error('Upload error:', {
        uri: file.uri,
        finalUri,
        error: error.message
      });
    } finally {
      setIsUploading(false);
      if (tempFilePath) {
        RNFS.unlink(tempFilePath).catch(() => {});
      }
    }
  };

  const handleRemoveFile = () => {
    setAlertTitle('删除文件');
    setAlertMessage('您确定要删除当前文件吗？');
    setAlertButtons([
      { text: '取消', style: 'cancel', onPress: () => setAlertVisible(false) },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          setAlertVisible(false);
          resetFile();
          showToast('文件已删除', "success");
        },
      },
    ]);
    setAlertVisible(true);
  };

  const resetFile = () => {
    setFileUrl('');
    setFileName('');
    setFileType('');
  };

  const getFileIcon = (name) => {
    if (!name) return 'insert-drive-file';
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'picture-as-pdf';
    if (['zip', '7z'].includes(ext)) return 'folder-zip';
    return 'insert-drive-file';
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-500 dark:text-gray-300 mb-2 text-sm">
        附件上传 (仅支持7z, zip最大150MB，仅支持上传一个文件)
      </Text>

      {fileUrl ? (
        <View className="flex-row items-center justify-between bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
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
          <TouchableOpacity onPress={handleRemoveFile} className="ml-2">
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
            <MaterialIcons name="cloud-upload" size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold">{isUploading ? '上传中...' : '选择文件上传'}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 自定义弹窗 */}
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

export default AttachmentUploader;