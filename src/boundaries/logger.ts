import dotenv from 'dotenv';
import winston from 'winston';
dotenv.config();

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});
