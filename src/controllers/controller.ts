import { NextFunction, Request, Response, Router } from 'express';
import { EndpointConfiguration } from './utilities';

export class Controller {
  public readonly router: Router;
  public readonly path: string;

  public static defaultInputSchema = {
    body: undefined,
    query: undefined,
    params: undefined,
  };

  constructor(path: string) {
    this.router = Router();
    this.path = path;
  }

  public createEndpoint<Context, Body, Query, Params, ResponseData>(
    config: EndpointConfiguration<Context, Body, Query, Params, ResponseData>
  ) {
    this.router.use(
      `${this.path}${config.route}`,
      async (
        request: Request<Params, ResponseData, Body, Query>,
        response: Response<ResponseData>,
        next: NextFunction
      ) => {
        const { body, query, params, headers, method } = request;
        if (method !== config.method) {
          return next();
        }

        config.inputSchemas.body?.validateSync(body, { strict: true });
        config.inputSchemas.query?.validateSync(query, { strict: true });
        config.inputSchemas.params?.validateSync(params, { strict: true });

        const authorizationContext = await config.authorization(headers);
        const endpointResponse = await config.callback(
          { body, query, params },
          authorizationContext
        );
        response.status(config.successCode).send(endpointResponse).end();
      }
    );
  }
}
