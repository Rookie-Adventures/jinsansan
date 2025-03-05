import { Router } from 'express';
import { VerificationController } from '../controllers/verification';

export function createVerificationRouter(controller: VerificationController): Router {
  const router = Router();

  // 发送验证码
  router.post('/send', controller.sendCode.bind(controller));

  // 验证验证码
  router.post('/verify', controller.verifyCode.bind(controller));

  return router;
} 