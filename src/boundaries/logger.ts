import dotenv from 'dotenv';
import winston from 'winston';
import { environment } from './environment';
dotenv.config();

export const logger = winston.createLogger({
  level: environment.logLevel,
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});
