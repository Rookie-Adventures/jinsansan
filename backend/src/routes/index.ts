import { Router } from 'express';
import { appConfig } from '../config';

const router = Router();

// 健康检查路由
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    env: appConfig.env
  });
});

// 在这里注册其他路由
// router.use('/auth', authRouter);
// router.use('/users', userRouter);
// router.use('/orders', orderRouter);

export default router; 