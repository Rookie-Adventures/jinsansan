import swaggerJsdoc from 'swagger-jsdoc';
import { appConfig } from './app.config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jinshanshan API Documentation',
      version: '1.0.0',
      description: 'API documentation for Jinshanshan backend services',
    },
    servers: [
      {
        url: `http://localhost:${appConfig.port}${appConfig.apiPrefix}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'], // 路由和模型文件的路径
};

export const swaggerSpec = swaggerJsdoc(options); 