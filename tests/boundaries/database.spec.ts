import { Sequelize } from 'sequelize';
import { DatabaseEnvironment } from '../../src/boundaries';
import { Database } from '../../src/boundaries/database';

const databaseEnvironment: DatabaseEnvironment = {
  host: 'localhost',
  port: 3306,
  name: 'database',
  username: 'username',
  password: 'password',
};

describe('Database', () => {
  const instance = new Database(databaseEnvironment);
  const initModels = (sequelize: Sequelize) => {
    expect(sequelize).toBeInstanceOf(Sequelize);
  };

  test('Creating an Instance will create an underlying Sequelize instance', () => {
    expect(instance['connection'].config).toMatchObject({
      host: databaseEnvironment.host,
      port: databaseEnvironment.port,
      database: databaseEnvironment.name,
      username: databaseEnvironment.username,
      password: databaseEnvironment.password,
    });
  });

  describe('Static initialize function', () => {
    test('Will create an instance, connect, and initialize models', async () => {
      const connectSpy = jest
        .spyOn(Database.prototype, 'connect')
        .mockImplementationOnce(() => Promise.resolve());

      await Database.initialize(databaseEnvironment, initModels);
      expect(connectSpy).toHaveBeenCalledTimes(1);
      expect(connectSpy).toHaveBeenCalledWith(initModels);
    });
  });

  describe('Instance methods', () => {
    const testError = new Error('Cannot connect to Database');

    describe('Connect', () => {
      const authenticateSpy = jest.spyOn(Sequelize.prototype, 'authenticate');

      test('Will establish a connection to the Database', async () => {
        authenticateSpy.mockImplementationOnce(() => Promise.resolve());
        await instance.connect(initModels);
        expect(authenticateSpy).toHaveBeenCalledTimes(1);
      });

      test('Will reject the Promise if connection fails', async () => {
        authenticateSpy.mockImplementationOnce(() => Promise.reject(testError));
        await expect(instance.connect(initModels)).rejects.toThrow(testError);
      });
    });

    describe('Close', () => {
      const closeSpy = jest.spyOn(Sequelize.prototype, 'close');

      test('Will close the database connection', async () => {
        closeSpy.mockImplementationOnce(() => Promise.resolve());
        await instance.close();
        expect(closeSpy).toHaveBeenCalledTimes(1);
      });

      test('Will reject the Promise if closure fails', async () => {
        closeSpy.mockImplementationOnce(() => Promise.reject(testError));
        await expect(instance.close()).rejects.toThrow(testError);
      });
    });
  });
});
