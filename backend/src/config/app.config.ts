import * as dotenv from 'dotenv';

dotenv.config();

interface AppConfig {
  port: number;
  env: string;
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
};

export default config; 