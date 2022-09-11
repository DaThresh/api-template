import { MissingEnvironmentError } from '../utilities/errors';
import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

export type Environment = 'production' | 'stage' | 'qa' | 'development' | 'sandbox';

export const whichEnv = (): Environment => {
  if (
    ['production', 'stage', 'qa', 'development', 'sandbox'].includes(process.env.NODE_ENV ?? '')
  ) {
    return process.env.NODE_ENV as Environment;
  } else {
    throw new MissingEnvironmentError('Missing NODE_ENV environment variable');
  }
};

logger.info(`Operating in ${whichEnv()} environment`);
