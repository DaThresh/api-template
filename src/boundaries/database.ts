import { Dialect, Sequelize } from 'sequelize';
import logger from './logger';

type DatabaseConfig = {
  username: string;
  password: string;
  name: string;
  host: string;
  port: number;
  dialect?: Dialect;
};

class Database {
  protected connection: Sequelize;
  protected options: DatabaseConfig;

  constructor(options: DatabaseConfig) {
    this.options = options;
    this.connection = new Sequelize(options.name, options.username, options.password, {
      host: options.host,
      port: options.port,
      dialect: options.dialect || 'mysql',
      logging: (sql, milliseconds) => logger.verbose(`${sql} ${milliseconds}ms`),
      benchmark: true,
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
          logger.error(`Unable to close connection with ${name} gracefully`).error(error)
        );
    });
  }
}

export default Database;
