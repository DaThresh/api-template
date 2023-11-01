import express, { Express, NextFunction, Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import { ValidationError } from 'yup';
import { Controller } from '../controllers/controller';
import { ErrorResponse } from '../controllers/interfaces/common';
import { ApiError, NotFoundError } from '../utilities/errors';
import { logger } from './logger';

export class Server {
  private express: Express;
  private server?: HttpServer;

  constructor(...controllers: Controller[]) {
    this.express = express();
    this.express.use(express.json());

    this.registerLogger();
    for (const controller of controllers) {
      this.registerController(controller);
    }
    this.registerCatchAll();
    this.registerErrorHandler();

    return this;
  }

  public async listen(port: number, hostname?: string) {
    return new Promise<void>((resolve) => {
      this.server = this.express.listen(port, hostname ?? '0.0.0.0', () => {
        logger.info(`Listening for requests on port ${port}...`);
        resolve();
      });
    });
  }

  public async close() {
    return new Promise<void>((resolve, reject) => {
      logger.info(`Closing Server gracefully...`);
      this.server?.close((error) => {
        return error ? reject(error) : resolve();
      }) ?? resolve();
    });
  }

  private registerController(controller: Controller) {
    logger.info(`Registered controller with route /api${controller.path}`);
    this.express.use(`/api`, controller.router);
  }

  private registerLogger() {
    this.express.use((request, _, next) => {
      logger.http(`Received ${request.method} request at ${request.path}`);
      return next();
    });
  }

  private registerCatchAll() {
    this.express.use('/(.*)', () => {
      throw new NotFoundError('Route not found');
    });
  }

  private registerErrorHandler() {
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
        response.status(status).send({ name: error.name, message: error.message }).end();
      }
    );
  }
}
