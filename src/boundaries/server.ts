import express, { Express, NextFunction, Request, Response } from 'express';
import { ValidationError } from 'yup';
import { Controller } from '../controllers/controller';
import { ErrorResponse } from '../controllers/interfaces/common';
import { ApiError, NotFoundError } from '../utilities/errors';
import { logger } from './logger';

export class Server {
  private express: Express;

  constructor() {
    logger.info(`Launching ApiServer using Express`);
    this.express = express();
    this.express.use(express.json());
    this.express.use((request, _, next) => {
      logger.http(`Received ${request.method} request at ${request.path}`);
      next();
    });
    return this;
  }

  public registerController = (apiRoute: string, controller: Controller) => {
    logger.info(`Registered controller with route /api/${apiRoute}`);
    this.express.use(`/api/${apiRoute}`, controller.router);
  };

  public registerApiCatch = () => {
    this.express.use('/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  };

  public registerErrorHandler = () => {
    this.express.use(
      (
        error: Error | ApiError | ValidationError,
        request: Request,
        response: Response<ErrorResponse>,
        // Must have `_: NextFunction` as Express identifies 4 parameter functions as Error handlers
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _: NextFunction
      ) => {
        const fullPath = request.originalUrl;
        logger.http(`Encountered ${error.name} in ${request.method} request to ${fullPath}`);
        let status = 500;
        if (error instanceof ApiError) {
          status = error.statusCode;
        } else if (error instanceof ValidationError) {
          status = 400;
        } else {
          logger.error(
            `Unexpected HTTP error during ${request.method} request to ${fullPath}`,
            error
          );
        }
        response.status(status).send({ name: error.name, message: error.message });
      }
    );
  };

  public listen = (port: number, hostname?: string) => {
    const server = this.express.listen(port, hostname ?? '0.0.0.0', () => {
      logger.info(`ApiServer running on port ${port}`);
      logger.info(`Listening for requests...`);
    });

    process.on('SIGINT', () => {
      logger.info('Closing ApiServer gracefully');
      server.close((error) => {
        if (error) {
          logger.error('Unable to close ApiServer gracefully').error(error.stack);
        }
      });
    });
    return server;
  };
}
