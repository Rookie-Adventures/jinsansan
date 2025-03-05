/**
 * 验证码类型
 */
export type VerificationType = 'phone' | 'email';

/**
 * 验证码用途
 */
export type VerificationPurpose = 'login' | 'register' | 'reset-password';

/**
 * 发送验证码请求
 */
export interface SendVerificationCodeRequest {
  /** 验证码类型 */
  type: VerificationType;
  /** 目标（手机号或邮箱） */
  target: string;
  /** 验证码用途 */
  purpose: VerificationPurpose;
}

/**
 * 发送验证码响应
 */
export interface SendVerificationCodeResponse {
  /** 是否成功 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 剩余冷却时间（秒） */
  cooldown?: number;
}

/**
 * 验证验证码请求
 */
export interface VerifyCodeRequest {
  /** 验证码类型 */
  type: VerificationType;
  /** 目标（手机号或邮箱） */
  target: string;
  /** 验证码 */
  code: string;
  /** 验证码用途 */
  purpose: VerificationPurpose;
}

/**
 * 验证验证码响应
 */
export interface VerifyCodeResponse {
  /** 是否成功 */
  success: boolean;
  /** 消息 */
  message: string;
  /** 验证通过后的令牌（可选） */
  token?: string;
} 