import { HttpErrorType } from './types';

interface ErrorMessageTemplate {
  message: string;
  description?: string;
}

// 开发环境错误消息
const devErrorMessages: Record<HttpErrorType, ErrorMessageTemplate> = {
  NETWORK: {
    message: '网络连接失败',
    description: '请检查您的网络连接并重试'
  },
  TIMEOUT: {
    message: '请求超时',
    description: '服务器响应时间过长，请稍后重试'
  },
  AUTH: {
    message: '认证失败',
    description: '您的登录状态已过期，请重新登录'
  },
  SERVER: {
    message: '服务器错误',
    description: '服务器处理请求时发生错误，请稍后重试'
  },
  CLIENT: {
    message: '客户端错误',
    description: '请求参数有误，请检查后重试'
  },
  CANCEL: {
    message: '请求已取消',
    description: '您的操作已被取消'
  },
  REACT_ERROR: {
    message: '页面渲染错误',
    description: '页面组件渲染失败，请刷新页面'
  },
  VALIDATION: {
    message: '数据验证失败',
    description: '请检查输入的数据是否符合要求'
  },
  BUSINESS: {
    message: '业务处理失败',
    description: '操作无法完成，请检查后重试'
  },
  UNKNOWN: {
    message: '未知错误',
    description: '发生未知错误，请刷新页面或联系支持'
  },
  INFO: {
    message: '提示信息',
    description: '系统提示信息'
  },
  WARNING: {
    message: '警告信息',
    description: '系统警告信息'
  },
  ERROR: {
    message: '错误信息',
    description: '系统错误信息'
  }
};

// 生产环境错误消息
const prodErrorMessages: Record<HttpErrorType, ErrorMessageTemplate> = {
  NETWORK: {
    message: '网络连接失败',
    description: '请检查您的网络连接并重试'
  },
  TIMEOUT: {
    message: '请求超时',
    description: '服务器响应时间过长，请稍后重试'
  },
  AUTH: {
    message: '认证失败',
    description: '您的登录状态已过期，请重新登录'
  },
  SERVER: {
    message: '服务器错误',
    description: '服务器处理请求时发生错误，请稍后重试'
  },
  CLIENT: {
    message: '客户端错误',
    description: '请求参数有误，请检查后重试'
  },
  CANCEL: {
    message: '请求已取消',
    description: '您的操作已被取消'
  },
  REACT_ERROR: {
    message: '页面渲染错误',
    description: '页面组件渲染失败，请刷新页面'
  },
  VALIDATION: {
    message: '数据验证失败',
    description: '请检查输入的数据是否符合要求'
  },
  BUSINESS: {
    message: '业务处理失败',
    description: '操作无法完成，请检查后重试'
  },
  UNKNOWN: {
    message: '系统错误',
    description: '请刷新页面或联系支持'
  },
  INFO: {
    message: '提示信息',
    description: '系统提示信息'
  },
  WARNING: {
    message: '警告信息',
    description: '系统警告信息'
  },
  ERROR: {
    message: '错误信息',
    description: '系统错误信息'
  }
};

// 根据环境选择错误消息
export const errorMessages = process.env.NODE_ENV === 'development' 
  ? devErrorMessages 
  : prodErrorMessages; 