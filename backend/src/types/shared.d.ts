declare module '@jinshanshan/shared' {
  export type VerificationType = 'phone' | 'email';
  export type VerificationPurpose = 'login' | 'register' | 'reset-password';

  export interface SendVerificationCodeRequest {
    type: VerificationType;
    target: string;
    purpose: VerificationPurpose;
  }

  export interface SendVerificationCodeResponse {
    success: boolean;
    message: string;
    cooldown?: number;
  }

  export interface VerifyCodeRequest {
    type: VerificationType;
    target: string;
    code: string;
    purpose: VerificationPurpose;
  }

  export interface VerifyCodeResponse {
    success: boolean;
    message: string;
    token?: string;
  }
} 