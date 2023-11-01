import { Server } from '../../src/boundaries';
import { Database } from '../../src/boundaries/database';
import { gracefulShutdown } from '../../src/utilities/shutdown';

describe('Graceful Shutdown', () => {
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation();
  const serverCloseSpy = jest.spyOn(Server.prototype, 'close');
  const databaseCloseSpy = jest.spyOn(Database.prototype, 'close');
  const server = new Server();
  const database = new Database({
    host: 'localhost',
    port: 3306,
    name: 'database',
    password: 'password',
    username: 'username',
  });

  test('Will call close on all Services passed', async () => {
    await gracefulShutdown(server, database);
    expect(serverCloseSpy).toHaveBeenCalledTimes(1);
    expect(databaseCloseSpy).toHaveBeenCalledTimes(1);
  });

  test('Will call exit after connections are closed', async () => {
    await gracefulShutdown();
    expect(exitSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  test('Will fail if a passed close function throws an error', async () => {
    const testError = new Error('Testing bad graceful shutdown');
    serverCloseSpy.mockImplementationOnce(() => Promise.reject(testError));
    await expect(gracefulShutdown(server)).rejects.toThrow(testError);
  });
});
