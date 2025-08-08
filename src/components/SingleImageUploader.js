import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadFile } from '../utils/uploadUtils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';
import RNFetchBlob from 'rn-fetch-blob';
import CustomAlert from '../components/custom/CustomAlert';

const SingleImageUploader = ({ AccessToken, imgUrl, setImgUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [localUri, setLocalUri] = useState(null);
  const { colorScheme } = useColorScheme();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  const config = {
    authToken: AccessToken,
    bucketName: 'posts',
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleImageUpload = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        showToast('选择图片时出错');
        console.error(response.errorMessage);
        return;
      }

      try {
        const asset = response.assets[0];
        const uri = asset.uri;

        // 检查文件大小
        const fileInfo = await RNFetchBlob.fs.stat(uri);
        if (fileInfo.size > MAX_FILE_SIZE) {
          showToast('图片大小不能超过10MB');
          return;
        }

        const type = asset.type;
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(type)) {
          showToast('不支持的文件类型。请选择 JPEG, PNG 格式。');
          return;
        }

        setIsUploading(true);
        const uploadConfig = {
          ...config,
          contentType: type,
        };

        const uploadResult = await uploadFile(uri, uploadConfig);

        if (uploadResult.success) {
          setImgUrl(uploadResult.fileUrl);
          setLocalUri(uri);
          showToast('封面图片上传成功');
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

  const handleRemoveImage = () => {
    setAlertTitle('删除封面');
    setAlertMessage('您确定要删除当前封面图片吗？');
    setAlertButtons([
      {
        text: '取消',
        style: 'cancel',
        onPress: () => setAlertVisible(false),
      },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          setAlertVisible(false);
          setImgUrl('');
          setLocalUri(null);
          showToast('封面图片已删除');
        },
      },
    ]);
    setAlertVisible(true);
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 mb-2 text-sm">封面图片 (最大10MB)</Text>

      {imgUrl ? (
        <View className="relative">
          <Image
            source={{ uri: localUri || imgUrl }}
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={handleRemoveImage}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
          >
            <MaterialIcons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className={`p-4 rounded-lg items-center justify-center 
            ${isUploading ? 'bg-blue-300' : 'bg-[#409eff]'} 
            ${colorScheme === 'dark' ? 'border border-blue-400' : ''}`}
          onPress={handleImageUpload}
          disabled={isUploading}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="add-photo-alternate" size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold">{isUploading ? '上传中...' : '上传封面图片'}</Text>
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

export default SingleImageUploader;