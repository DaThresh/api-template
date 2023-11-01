import { IncomingHttpHeaders } from 'http';
import { AnyObject, ObjectSchema } from 'yup';

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type InputSchemas<Body, Query, Params> = {
  body: Body extends AnyObject ? ObjectSchema<Body> : undefined;
  query: Query extends AnyObject ? ObjectSchema<Query> : undefined;
  params: Params extends AnyObject ? ObjectSchema<Params> : undefined;
};

export type InputContext<Body, Query, Params> = {
  body: Body;
  query: Query;
  params: Params;
};

export type EndpointConfiguration<Context, Body, Query, Params, ResponseData> = {
  method: Method;
  route: string;
  successCode: number;
  callback: (
    inputContext: InputContext<Body, Query, Params>,
    authorizationContext: Context
  ) => ResponseData | Promise<ResponseData>;
  authorization: (headers: IncomingHttpHeaders) => Context | Promise<Context>;
  inputSchemas: InputSchemas<Body, Query, Params>;
};
