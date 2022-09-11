import winston from 'winston';
import dotenv from 'dotenv';
dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

export default logger;
