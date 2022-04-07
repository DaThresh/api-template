import { Dialect, Options, Sequelize } from 'sequelize';
import { initModels } from '../models';
import { SetupError } from '../utilities/errors';

type AppDBConfigOptions = {
  username: string;
  password: string;
  name: string;
  host: string;
  port: number;
  dialect?: Dialect;
};

abstract class AppDB {
  protected static connection?: Sequelize;
  protected static options: AppDBConfigOptions;

  public static async connect(options: AppDBConfigOptions) {
    const sequelizeOptions: Options = {
      host: options.host,
      port: options.port,
      dialect: 'mysql' || options.dialect,
    };

    AppDB.options = options;
    AppDB.connection = new Sequelize(
      options.name,
      options.username,
      options.password,
      sequelizeOptions
    );

    await AppDB.checkConnection();
    await initModels(AppDB.connection);
  }

  public static async checkConnection() {
    if (!AppDB.connection) {
      throw new SetupError('Connection to the database has not been established yet');
    }
    return AppDB.connection.authenticate();
  }
}

export default AppDB;
