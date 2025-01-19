import { HttpErrorType } from './types';

interface ErrorMessageTemplate {
  message: string;
  description?: string;
}

export const errorMessages: Record<HttpErrorType, ErrorMessageTemplate> = {
  [HttpErrorType.NETWORK]: {
    message: '网络连接失败，请检查网络设置',
    description: '无法连接到服务器，请确保网络连接正常'
  },
  [HttpErrorType.TIMEOUT]: {
    message: '请求超时，请稍后重试',
    description: '服务器响应时间过长'
  },
  [HttpErrorType.AUTH]: {
    message: '认证失败',
    description: '请检查您的登录状态'
  },
  [HttpErrorType.SERVER]: {
    message: '服务器错误，请稍后重试',
    description: '服务器内部发生错误'
  },
  [HttpErrorType.CLIENT]: {
    message: '请求参数错误',
    description: '请检查输入参数是否正确'
  },
  [HttpErrorType.VALIDATION]: {
    message: '输入数据验证失败',
    description: '请检查输入数据是否符合要求'
  },
  [HttpErrorType.BUSINESS]: {
    message: '操作失败，请检查后重试',
    description: '业务处理过程中发生错误'
  },
  [HttpErrorType.CANCEL]: {
    message: '请求已取消',
    description: '用户取消了请求'
  },
  [HttpErrorType.REACT_ERROR]: {
    message: process.env.NODE_ENV === 'development' 
      ? '组件渲染错误: ${error}'
      : '页面显示异常，请刷新重试',
    description: '页面渲染过程中发生错误'
  },
  [HttpErrorType.UNKNOWN]: {
    message: '发生未知错误，请稍后重试',
    description: '系统发生未知错误'
  }
}; 