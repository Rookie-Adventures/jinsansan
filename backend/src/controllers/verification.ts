import { Request, Response } from 'express';
import { VerificationService } from '../services/verification';
import { SendVerificationCodeRequest, VerifyCodeRequest } from '@jinshanshan/shared';

export class VerificationController {
  private verificationService: VerificationService;

  constructor(verificationService: VerificationService) {
    this.verificationService = verificationService;
  }

  /**
   * 发送验证码
   */
  async sendCode(req: Request<{}, {}, SendVerificationCodeRequest>, res: Response) {
    const { type, target, purpose } = req.body;

    const result = await this.verificationService.sendCode(type, target, purpose);
    res.json(result);
  }

  /**
   * 验证验证码
   */
  async verifyCode(req: Request<{}, {}, VerifyCodeRequest>, res: Response) {
    const { type, target, code, purpose } = req.body;

    const result = await this.verificationService.verifyCode(type, target, code, purpose);
    res.json(result);
  }
} 