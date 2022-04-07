import { Router, Request, Response, NextFunction } from 'express';
import { AnyObjectSchema } from 'yup';
import { AuthorizationError } from '../utilities/errors';

type method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class Controller {
  public readonly router: Router;

  constructor() {
    this.router = Router();
  }

  public createEndpoint<
    RequestBody = never,
    ResponseBody = never,
    RequestQuery = never,
    RequestUrlVariables = never
  >(
    method: method,
    route: string,
    inputSchema: AnyObjectSchema,
    callback: (
      request: Request<RequestUrlVariables, ResponseBody, RequestBody, RequestQuery>,
      response: Response<ResponseBody>,
      next?: NextFunction
    ) => void
  ) {
    this.router.use(
      route,
      async (
        request: Request<RequestUrlVariables, ResponseBody, RequestBody, RequestQuery>,
        response: Response<ResponseBody>,
        next: NextFunction
      ) => {
        if (request.headers.from !== 'rapidapi') {
          throw new AuthorizationError('Not authorized to use this resource');
        }
        if (request.method === method) {
          inputSchema.validateSync(request.body);
          await callback(request, response, next);
        } else {
          next();
        }
      }
    );
  }
}

export default Controller;
