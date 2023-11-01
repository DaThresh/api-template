import { Sequelize } from 'sequelize';
import { DatabaseEnvironment } from './environment';
import { logger } from './logger';

export class Database {
  protected connection: Sequelize;

  public static async initialize(
    environment: DatabaseEnvironment,
    initModels: (sequelize: Sequelize) => void
  ) {
    const database = new Database(environment);
    await database.connect(initModels);
    return database;
  }

  constructor(environment: DatabaseEnvironment) {
    this.connection = new Sequelize({
      host: environment.host,
      port: environment.port,
      database: environment.name,
      username: environment.username,
      password: environment.password,
      dialect: 'mysql',
      benchmark: true,
      logging: (sql, milliseconds) => logger.verbose(`${sql} ${milliseconds}ms`),
    });

    return this;
  }

  public async connect(initModels: (sequelize: Sequelize) => void) {
    initModels(this.connection);
    await this.connection.authenticate();
    logger.info(`Verified connection to Database`);
  }

  public async close() {
    try {
      logger.info(`Closing Database connection gracefully...`);
      await this.connection.close();
    } catch (error) {
      logger.error(`Failed to close connection with Database`, error);
      throw error;
    }
  }
}
