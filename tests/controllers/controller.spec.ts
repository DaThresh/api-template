import { Router } from 'express';
import request from 'supertest';
import { object, string } from 'yup';
import { Server } from '../../src/boundaries';
import { Controller } from '../../src/controllers/controller';

describe('Controller', () => {
  describe('Create Endpoint', () => {
    const useSpy = jest.spyOn(Router.prototype, 'use');

    test('Will pass the correct path to Express Router', () => {
      const controller = new Controller('/outer');
      controller.createEndpoint({
        method: 'GET',
        route: '/inner',
        authorization: () => null,
        successCode: 200,
        inputSchemas: Controller.defaultInputSchema,
        callback: () => {},
      });

      expect(useSpy).toHaveBeenCalledTimes(1);
      expect(useSpy).toHaveBeenCalledWith('/outer/inner', expect.any(Function));
    });
  });

  describe('Server usage', () => {
    const controller = new Controller('/test');
    controller.createEndpoint({
      method: 'GET',
      route: '/',
      successCode: 200,
      authorization: () => null,
      inputSchemas: {
        ...Controller.defaultInputSchema,
        query: object({ id: string().required() }),
      },
      callback: () => null,
    });
    const server = new Server(controller);

    test('Will skip the Handler if the method does not match', async () => {
      const response = await request(server['express']).post('/api/test');
      expect(response.status).toBe(404);
    });

    test('Will throw a Validation Error if Input Schemas are not right', async () => {
      const response = await request(server['express']).get('/api/test');
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'id is a required field',
        name: 'ValidationError',
      });
    });

    test('Authorization Context will be provided to the handler', async () => {
      controller.createEndpoint({
        method: 'POST',
        route: '/authorization',
        successCode: 201,
        authorization: (headers) => ({ id: headers['id'] }),
        inputSchemas: Controller.defaultInputSchema,
        callback: ({}, { id }) => {
          expect(id).toBe('testing');
        },
      });

      const response = await request(server['express'])
        .post('/api/test/authorization')
        .set({ id: 'testing' });
      expect(response.status).toBe(201);
    });
  });
});
