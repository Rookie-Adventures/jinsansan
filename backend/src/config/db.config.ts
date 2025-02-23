import * as dotenv from 'dotenv';

dotenv.config();

interface DbConfig {
  uri: string;
  dbName: string;
}

const config: DbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'mydatabase',
};

export default config; 