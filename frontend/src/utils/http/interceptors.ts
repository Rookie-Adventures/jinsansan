import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useGlobalProgress } from '@/hooks/feedback/useGlobalProgress';

export const setupInterceptors = (instance: AxiosInstance) => {
  let requestCount = 0;
  let uploadProgress = 0;
  let downloadProgress = 0;

  const updateProgress = () => {
    const progress = (uploadProgress + downloadProgress) / 2;
    useGlobalProgress.getState().setProgress(progress);
  };

  const updateLoading = () => {
    requestCount = Math.max(0, requestCount);
    useGlobalProgress.getState().setLoading(requestCount > 0);
    if (requestCount === 0) {
      uploadProgress = 0;
      downloadProgress = 0;
      useGlobalProgress.getState().setProgress(null);
    }
  };

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      requestCount++;
      updateLoading();

      // 添加上传进度监听
      config.onUploadProgress = (event) => {
        if (event.total) {
          uploadProgress = (event.loaded / event.total) * 100;
          updateProgress();
        }
      };

      // 添加下载进度监听
      config.onDownloadProgress = (event) => {
        if (event.total) {
          downloadProgress = (event.loaded / event.total) * 100;
          updateProgress();
        }
      };

      return config;
    },
    (error: AxiosError) => {
      requestCount--;
      updateLoading();
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      requestCount--;
      updateLoading();
      return response;
    },
    (error: AxiosError) => {
      requestCount--;
      updateLoading();
      return Promise.reject(error);
    }
  );

  return instance;
}; 