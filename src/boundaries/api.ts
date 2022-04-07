import express, { Express } from 'express';
import Controller from '../controllers/controller';
import { NotFoundError, SetupError } from '../utilities/errors';

abstract class ApiServer {
  protected static app?: Express;

  public static init = (): Express => {
    if (ApiServer.app) {
      throw new SetupError('API already initialized');
    }

    ApiServer.app = express();
    ApiServer.app.use(express.json());
    return ApiServer.app;
  };

  public static registerController = (apiRoute: string, controller: Controller) => {
    if (!ApiServer.app) {
      throw new SetupError('API not initialized');
    }

    ApiServer.app.use(`/api/${apiRoute}`, controller.router);
  };

  public static registerApiCatch = () => {
    if (!ApiServer.app) {
      throw new SetupError('API not initialized');
    }

    ApiServer.app.use('/api/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  };

  public static listen = (port: number, hostname?: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!ApiServer.app) {
        throw new SetupError('API not initialized');
      }

      ApiServer.app
        .listen(port, hostname ?? '0.0.0.0', () => resolve())
        .on('error', (error: Error) => reject(error));
    });
  };
}

export default ApiServer;
