import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

export type DatabaseEnvironment = {
  host: string;
  port: number;
  name: string;
  username: string;
  password: string;
}

export type Environment = {
  appName: string;
  port: number;
  database: DatabaseEnvironment;
}

export const environment: Environment = {
  appName: 'api-template',
  port: +(process.env.PORT ?? 8080),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: +(process.env.DATABASE_PORT ?? 3306),
    name: process.env.DATABASE_NAME ?? 'database',
    username: process.env.DATABASE_USERNAME ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
  }
}

logger.info(`Environment configuration loaded`);
