import { HttpErrorType } from './types';

interface ErrorMessageTemplate {
  message: string;
  description?: string;
}

// 开发环境错误消息
const devErrorMessages: Record<HttpErrorType, ErrorMessageTemplate> = {
  [HttpErrorType.NETWORK]: {
    message: '网络连接失败 (DEV)',
    description: '无法连接到服务器，请检查网络设置和服务器状态'
  },
  [HttpErrorType.TIMEOUT]: {
    message: '请求超时 (DEV)',
    description: '服务器响应时间过长，请检查服务器性能'
  },
  [HttpErrorType.AUTH]: {
    message: '认证失败 (DEV)',
    description: '请检查认证信息和权限配置'
  },
  [HttpErrorType.SERVER]: {
    message: '服务器错误 (DEV)',
    description: '服务器内部错误，请检查服务器日志'
  },
  [HttpErrorType.CLIENT]: {
    message: '客户端错误 (DEV)',
    description: '请求参数错误，请检查API文档'
  },
  [HttpErrorType.VALIDATION]: {
    message: '数据验证失败 (DEV)',
    description: '输入数据不符合验证规则，请检查验证器配置'
  },
  [HttpErrorType.BUSINESS]: {
    message: '业务逻辑错误 (DEV)',
    description: '业务规则验证失败，请检查业务逻辑'
  },
  [HttpErrorType.CANCEL]: {
    message: '请求已取消 (DEV)',
    description: '用户或系统取消了请求'
  },
  [HttpErrorType.REACT_ERROR]: {
    message: 'React错误: ${error}',
    description: '组件渲染错误，请检查组件代码'
  },
  [HttpErrorType.UNKNOWN]: {
    message: '未知错误 (DEV)',
    description: '发生未预期的错误，请检查系统日志'
  }
};

// 生产环境错误消息
const prodErrorMessages: Record<HttpErrorType, ErrorMessageTemplate> = {
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
    message: '页面显示异常，请刷新重试',
    description: '页面渲染过程中发生错误'
  },
  [HttpErrorType.UNKNOWN]: {
    message: '发生未知错误，请稍后重试',
    description: '系统发生未知错误'
  }
};

// 根据环境选择错误消息
export const errorMessages = process.env.NODE_ENV === 'development' 
  ? devErrorMessages 
  : prodErrorMessages; 