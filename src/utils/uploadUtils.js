import axios from 'axios';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { BASE_INFO } from "../constant/base";
import setupAuthInterceptors from '../utils/axios/AuthInterceptors'

const api = axios.create();
setupAuthInterceptors(api);
// 配置项
const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 默认5MB
const DEFAULT_MAX_RETRIES = 3; // 默认重试3次
/**
 * 分片上传主函数
 * @param {string} filePath - 文件路径
 * @param {object} config - 配置对象
 * @param {string} config.baseUrl - 基础URL
 * @param {string} config.authToken - 认证token
 * @param {string} config.bucketName - 存储桶名称
 * @param {number} [config.chunkSize] - 分片大小，默认5MB
 * @param {number} [config.maxRetries] - 最大重试次数，默认3
 * @returns {Promise<object>} - 返回上传结果
 */
export const uploadFile = async (filePath, config) => {
  try {
    const {
      authToken,
      bucketName,
      chunkSize = DEFAULT_CHUNK_SIZE,
      maxRetries = DEFAULT_MAX_RETRIES,
      contentType,
      fileName = "_",
    } = config;
    const baseUrl = BASE_INFO.BASE_URL;
    // 获取文件信息
    const fileInfo = await RNFetchBlob.fs.stat(filePath);
    const fileSize = fileInfo.size;

    if (fileSize <= chunkSize) {
      return await quickUpload(filePath, fileName, {
        baseUrl,
        authToken,
        bucketName,
        maxRetries,
        contentType,
      });
    }

    return await multipartUpload(filePath, fileName, fileSize, {
      baseUrl,
      authToken,
      bucketName,
      chunkSize,
      maxRetries,
      contentType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

/**
 * 分片上传大文件
 */
const multipartUpload = async (filePath, fileName, fileSize, config) => {
  const {
    baseUrl,
    authToken,
    bucketName,
    chunkSize,
    maxRetries,
    contentType,
  } = config;

  try {
    const initiateResponse = await retryableRequest(
      () => api.post(
        `${baseUrl}upload/initiate`,
        {
          fileName,
          contentType: contentType || 'application/octet-stream',
          bucketName,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      ),
      maxRetries
    );

    if (!initiateResponse.data.uploadId || !initiateResponse.data.objectName) {
      return {
        success: false,
        error: 'Failed to initiate upload session',
      };
    }

    const uploadSession = {
      uploadId: initiateResponse.data.uploadId,
      objectName: initiateResponse.data.objectName,
      bucketName,
      uploadedParts: [],
    };

    // 2. Upload chunks
    const chunkCount = Math.ceil(fileSize / chunkSize);
    const chunkPromises = [];

    for (let i = 0; i < chunkCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const partNumber = i + 1;

      chunkPromises.push(
        uploadChunkWithRetry(
          filePath,
          start,
          end,
          partNumber,
          uploadSession,
          {
            baseUrl,
            authToken,
            maxRetries,
            contentType,
          }
        )
      );
    }

    await Promise.all(chunkPromises);

    const completeResponse = await retryableRequest(
      () => api.post(
        `${baseUrl}upload/complete`,
        {
          uploadId: uploadSession.uploadId,
          parts: uploadSession.uploadedParts.map(part => ({
              partNumber: part.partNumber,
              etag: part.etag,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      ),
      maxRetries
    );

    if (completeResponse.status !== 200) {
      await api.post(
        `${baseUrl}upload/abort`,
        {
          uploadId: uploadSession.uploadId,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      return {
        success: false,
        error: 'Failed to complete upload',
      };
    }

    return {
      success: true,
      fileUrl: `${baseUrl}dl/${bucketName}/${uploadSession.objectName}`,
    };
  } catch (error) {
    console.error('Multipart upload error:', error);
    return {
      success: false,
      error: error.message || 'Multipart upload failed',
    };
  }
};

/**
 * 分片上传（带重试）
 */
const uploadChunkWithRetry = async (
  filePath,
  start,
  end,
  partNumber,
  uploadSession,
  config
) => {
  const { baseUrl, authToken, maxRetries, contentType } = config;

  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const chunkSize = end - start;
      const chunkPath = `${RNFS.CachesDirectoryPath}/chunk_${partNumber}_${Date.now()}.tmp`;

      // 使用 react-native-fs 分片读取写入临时文件
      const fileData = await RNFS.read(filePath.replace('file://', ''), chunkSize, start, 'base64');
      await RNFS.writeFile(chunkPath, fileData, 'base64');

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? `file://${chunkPath}` : chunkPath,
        type: contentType || 'application/octet-stream',
        name: `chunk_${partNumber}`,
      });

      const response = await api.post(
        `${baseUrl}upload/part?uploadId=${uploadSession.uploadId}&partNumber=${partNumber}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // 清理临时文件
      await RNFS.unlink(chunkPath).catch(() => {});

      if (response.data.etag) {
        uploadSession.uploadedParts.push({
          etag: response.data.etag,
          partNumber,
        });
        return;
      } else {
        throw new Error('Missing etag in response');
      }
    } catch (error) {
      lastError = error;
      console.warn(
        `Upload chunk ${partNumber} attempt ${attempt + 1} failed:`,
        error.message
      );
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError || new Error(`Failed to upload chunk ${partNumber}`);
};

/**
 * 小文件直接上传
 */
const quickUpload = async (filePath, fileName, config) => {
  const { baseUrl, authToken, bucketName, maxRetries, contentType } = config;

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: filePath,
      type: contentType || 'application/octet-stream',
      name: fileName,
    });
    formData.append('bucketName', bucketName);
    const response = await retryableRequest(
      () => api.post(`${baseUrl}upload/quick`, formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }),
      maxRetries
    );

    if (response.data.objectName) {
      return {
        success: true,
        fileUrl: `${baseUrl}dl/${bucketName}/${response.data.objectName}`,
      };
    } else {
      return {
        success: false,
        error: 'Upload response missing objectName',
      };
    }
  } catch (error) {
    console.error('Quick upload error:', error);
    return {
      success: false,
      error: error.message || 'Quick upload failed',
    };
  }
};

/**
 * 可重试的请求
 */
const retryableRequest = async (request, maxRetries) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      console.warn(`Request attempt ${attempt + 1} failed:`, error.message);
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
      }
    }
  }
  throw lastError || new Error('Request failed');
};