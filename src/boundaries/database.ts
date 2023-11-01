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
    const name = this.constructor.name;

    await this.connection.authenticate();
    logger.info(`Verified connection to ${name}`);
    await initModels(this.connection);
    logger.info(`Initialized models for ${name}`);

    process.on('SIGINT', () => {
      logger.info(`Terminating connection with ${name} gracefully`);
      this.connection
        .close()
        .catch((error) =>
          logger.error(`Unable to close connection with ${name} gracefully`).error(error.stack)
        );
    });
  }
}
