import { Sequelize } from 'sequelize';
import { Authentication } from './authentication';
import { Database } from './database';
import { Environment } from './environment';
import { logger } from './logger';

export * from './environment';
export * from './logger';
export * from './server';

export abstract class Boundaries {
  public static Database: Database;
  public static Authentication: Authentication;

  public static async initialize(
    environment: Environment,
    initModels: (sequelize: Sequelize) => void
  ) {
    this.Database = await Database.initialize(environment.database, initModels);
    this.Authentication = new Authentication(environment);
    logger.info(`Environment configuration loaded`);
  }
}
