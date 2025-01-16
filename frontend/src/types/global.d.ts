/// <reference types="vite/client" />
import { compose } from 'redux';

declare global {
  // 环境变量类型声明
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_APP_TITLE: string;
    readonly VITE_APP_ENV: 'development' | 'production' | 'test';
    readonly VITE_APP_VERSION: string;
  }

  // 扩展 Window 接口
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    __APP_CONFIG__: {
      apiBaseUrl: string;
      environment: string;
      version: string;
    };
  }
}

// 确保这个文件被视为一个模块
export {}; 