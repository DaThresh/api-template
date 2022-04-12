import express, { Express, Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import Controller from '../controllers/controller';
import { ErrorResponse } from '../controllers/interfaces/common';
import ApiError, { NotFoundError, SetupError } from '../utilities/errors';

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

    ApiServer.app.use(`/${apiRoute}`, controller.router);
  };

  public static registerApiCatch = () => {
    if (!ApiServer.app) {
      throw new SetupError('API not initialized');
    }

    ApiServer.app.use('/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  };

  public static registerErrorHandler = () => {
    if (!ApiServer.app) {
      throw new SetupError('API not initialized');
    }

    ApiServer.app.use(
      (
        error: Error | ApiError,
        request: Request,
        response: Response<ErrorResponse>,
        // Must have `_: NextFunction` as Express identifies 4 parameter functions as Error handlers
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _: NextFunction
      ) => {
        console.error(
          `Encountered ${error.name} in ${request.method} request to ${request.originalUrl}`
        );
        let status = 500;
        if (error instanceof ApiError) {
          status = error.statusCode;
        } else if (error instanceof ValidationError) {
          status = 400;
        } else {
          console.error(error);
        }
        response.status(status).send({ name: error.name, message: error.message });
      }
    );
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
