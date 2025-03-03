import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { appConfig, connectMongoDB, connectRedis, swaggerSpec } from './config';
import routes from './routes';

const app = express();

// 连接数据库
connectMongoDB().catch(console.error);
// 暂时注释掉 Redis 连接
// connectRedis().catch(console.error);

// 基础中间件
app.use(helmet());
app.use(cors(appConfig.corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 日志中间件
app.use(loggerMiddleware);

// 注册API路由
app.use(appConfig.apiPrefix, routes);

// 错误处理中间件
app.use(errorMiddleware);

// 启动服务器
if (require.main === module) {
  app.listen(appConfig.port, () => {
    console.log(`Server is running on port ${appConfig.port}`);
    console.log(`API Documentation available at http://localhost:${appConfig.port}/api-docs`);
  });
}

export default app; 