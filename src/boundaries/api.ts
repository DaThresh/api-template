import express, { Express, Request, Response, NextFunction } from 'express';
import { ValidationError } from 'yup';
import Controller from '../controllers/controller';
import { ErrorResponse } from '../controllers/interfaces/common';
import ApiError, { NotFoundError } from '../utilities/errors';
import logger from './logger';

class ApiServer {
  protected app: Express;

  constructor() {
    logger.info(`Launching ApiServer using Express`);
    this.app = express();
    this.app.use(express.json());
    this.app.use((request, _, next) => {
      logger.http(`Received ${request.method} request at ${request.path}`);
      next();
    });
    return this;
  }

  public registerController = (apiRoute: string, controller: Controller) => {
    logger.info(`Registered controller with route /api/${apiRoute}`);
    this.app.use(`/api/${apiRoute}`, controller.router);
  };

  public registerApiCatch = () => {
    this.app.use('/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  };

  public registerErrorHandler = () => {
    this.app.use(
      (
        error: Error | ApiError,
        request: Request,
        response: Response<ErrorResponse>,
        // Must have `_: NextFunction` as Express identifies 4 parameter functions as Error handlers
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _: NextFunction
      ) => {
        logger.error(
          `Encountered ${error.name} in ${request.method} request to ${request.originalUrl}`
        );
        let status = 500;
        if (error instanceof ApiError) {
          status = error.statusCode;
        } else if (error instanceof ValidationError) {
          status = 400;
        } else {
          logger.error(error);
        }
        response.status(status).send({ name: error.name, message: error.message });
      }
    );
  };

  public listen = (port: number, hostname?: string) => {
    const server = this.app.listen(port, hostname ?? '0.0.0.0', () => {
      logger.info(`ApiServer running on port ${port}`);
      logger.info(`Listening for requests...`);
    });

    process.on('SIGINT', () => {
      logger.info('Closing ApiServer gracefully');
      server.close((error) => {
        if (error) {
          logger.error('Unable to close ApiServer gracefully');
          throw error;
        }
      });
    });
    return server;
  };
}

export default new ApiServer();
