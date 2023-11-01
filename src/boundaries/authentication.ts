import { IncomingHttpHeaders } from 'http2';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { AuthenticationError } from 'src/utilities/errors';
import { Environment } from './environment';
import logger from './logger';

export class Authentication {
  private tenantDomain: string;
  private appName: string;

  constructor(environment: Environment) {
    this.tenantDomain = environment.auth0.tenantDomain;
    this.appName = environment.appName;
  }

  public async authenticate(headers: IncomingHttpHeaders) {
    const token = this.extractToken(headers.authorization);
    const { payload } = await jwtVerify(token, this.getRemoteJWKSet(), {
      audience: this.appName,
      issuer: `https://${this.tenantDomain}/`,
      requiredClaims: ['sub'],
      algorithms: ['RS256'],
      typ: 'JWT',
    });
    if (!payload.sub) {
      throw new AuthenticationError('Cannot Authenticate Identity');
    }
    return { subject: { id: payload.sub } };
  }

  private getRemoteJWKSet() {
    return createRemoteJWKSet(new URL(`https://${this.tenantDomain}/.well-known/jwks.json`));
  }

  private extractToken(authorization?: string) {
    const splitToken = authorization?.split(' ');
    if (splitToken?.[0] !== 'Bearer' || !splitToken?.[1]) {
      logger.warn(`Received request where Authorization token was unable to be parsed`);
      throw new AuthenticationError('Cannot parse token');
    }
    return splitToken[1];
  }
}
