import express, { application } from 'express';
import { Server as HttpServer } from 'http';
import request from 'supertest';
import { ValidationError } from 'yup';
import { Server } from '../../src/boundaries';
import { Controller } from '../../src/controllers/controller';
import { AuthorizationError } from '../../src/utilities/errors';

describe('Server', () => {
  test('Creating an Instance will initialize Express', () => {
    const instance = new Server();
    expect(instance['express']).not.toBeUndefined();
  });

  test('Will initialize with middleware', () => {
    const jsonSpy = jest.spyOn(express, 'json');
    const loggerSpy = jest.spyOn(Server.prototype as any, 'registerLogger');
    const catchAllSpy = jest.spyOn(Server.prototype as any, 'registerCatchAll');
    const errorHandlerSpy = jest.spyOn(Server.prototype as any, 'registerErrorHandler');
    new Server();

    expect(jsonSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(catchAllSpy).toHaveBeenCalledTimes(1);
    expect(errorHandlerSpy).toHaveBeenCalledTimes(1);
  });

  test('Will initialize all Controllers passed in', () => {
    const registerControllerSpy = jest.spyOn(Server.prototype as any, 'registerController');
    const [firstController, secondController] = [new Controller('/v1'), new Controller('/v2')];
    new Server(firstController, secondController);

    expect(registerControllerSpy).toHaveBeenCalledTimes(2);
  });

  describe('Instance methods', () => {
    const useSpy = jest.spyOn(application, 'use');

    describe('Listen', () => {
      test('Will call listen', async () => {
        const listenSpy = jest.spyOn(application, 'listen');
        const instance = new Server();
        await instance.listen(8080);
        await instance.close();
        expect(listenSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Close', () => {
      test('Will close the HTTP Server', async () => {
        const closeSpy = jest.spyOn(HttpServer.prototype, 'close');
        const instance = new Server();
        await instance.listen(8080);
        await instance.close();
        expect(closeSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Register controller', () => {
      test('Will Register Controller with Express', () => {
        const controller = new Controller('/v1');
        new Server(controller);

        expect(useSpy).toHaveBeenCalledWith(`/api`, controller.router);
      });
    });

    describe('Register catch all', () => {
      test('Will Register a Catch All Route with Express', () => {
        new Server();
        expect(useSpy).toHaveBeenCalledWith(`/(.*)`, expect.any(Function));
      });

      test('Will return a 404 Error if requesting an unknown route', async () => {
        const server = new Server();
        const response = await request(server['express']).get('/unknown');
        expect(response.status).toBe(404);
        expect(response.body).toStrictEqual({
          message: 'Route not found',
          name: 'NotFoundError',
        });
      });
    });
  });

  describe('Error Handling', () => {
    const testErrorHandling = async (error: unknown) => {
      const controller = new Controller('/test');
      controller.createEndpoint({
        method: 'GET',
        route: '/',
        authorization: () => null,
        successCode: 200,
        inputSchemas: Controller.defaultInputSchema,
        callback: () => {
          throw error;
        },
      });
      const server = new Server(controller);
      return await request(server['express']).get('/api/test');
    };

    test('Will return a 400 if a Yup Validation Error is thrown', async () => {
      const error = new ValidationError('Testing Validation Error');
      const response = await testErrorHandling(error);
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Testing Validation Error',
        name: 'ValidationError',
      });
    });

    test('Will return the correct status code with an Api Error', async () => {
      const error = new AuthorizationError('Testing Authorization Error');
      const response = await testErrorHandling(error);
      expect(response.status).toBe(403);
      expect(response.body).toStrictEqual({
        message: 'Testing Authorization Error',
        name: 'AuthorizationError',
      });
    });

    test('Will return a 500 if the Error is unrecognized', async () => {
      const error = new Error('Testing Other Errors');
      const response = await testErrorHandling(error);
      expect(response.status).toBe(500);
      expect(response.body).toStrictEqual({
        message: 'Testing Other Errors',
        name: 'Error',
      });
    });
  });
});
