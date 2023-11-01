import { exit } from 'process';
import { Server, logger } from '../boundaries';
import { Database } from '../boundaries/database';

export const gracefulShutdown = async (...services: (Server | Database)[]) => {
  logger.info(`Attempting to close gracefully...`);
  await Promise.all(services.map((service) => service.close()))
    .then(() => exit(0))
    .catch((error) => {
      logger.error(`Failed to gracefully shutdown`);
      throw error;
    });
};
