import {
  JWTHeaderParameters,
  KeyLike,
  SignJWT,
  createLocalJWKSet,
  errors,
  exportJWK,
  generateKeyPair,
} from 'jose';
import { Authentication } from '../../src/boundaries/authentication';
import { AuthenticationError } from '../../src/utilities/errors';
import { sampleEnvironment } from '../utilities/environment';
const { JWTExpired, JWTClaimValidationFailed, JOSEAlgNotAllowed, JWSSignatureVerificationFailed } =
  errors;

type TokenCreationOptions = {
  issueTime?: number;
  expireTime?: number;
  notBeforeTime?: number;
  issuer?: string;
  audience?: string;
  subject?: string;
  headers?: JWTHeaderParameters;
  publicKey?: KeyLike;
};

describe('Authentication class', () => {
  const instance = new Authentication(sampleEnvironment);
  const getRemoteJWKSetSpy = jest.spyOn(Authentication.prototype as any, 'getRemoteJWKSet');
  // Must use type any to spy on private method

  const createHeaders = async (options?: TokenCreationOptions) => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const keySet = await createLocalJWKSet({
      keys: [await exportJWK(options?.publicKey ?? publicKey)],
    });
    getRemoteJWKSetSpy.mockImplementationOnce(() => keySet);

    const pastTime = Date.now() - 1000;
    const futureTime = Date.now() + 60000;
    const jwt = await new SignJWT({ jti: 'token-id' })
      .setIssuedAt((options?.issueTime ?? pastTime) / 1000)
      .setNotBefore((options?.notBeforeTime ?? pastTime) / 1000)
      .setExpirationTime((options?.expireTime ?? futureTime) / 1000)
      .setIssuer(options?.issuer ?? `https://${sampleEnvironment.auth0.tenantDomain}/`)
      .setAudience(options?.audience ?? sampleEnvironment.appName)
      .setSubject(options?.subject ?? 'subject-id')
      .setProtectedHeader(options?.headers ?? { alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);
    return { authorization: `Bearer ${jwt}` };
  };

  describe('Authenticate Subject', () => {
    test('Will Verify a valid token', async () => {
      const headers = await createHeaders();
      const subject = await instance.authenticate(headers);
      expect(subject.subject).toHaveProperty('id', 'subject-id');
    });

    describe('Error handling', () => {
      test('Will fail with a deformed token', async () => {
        await expect(instance.authenticate({ authorization: 'Basic ABC' })).rejects.toThrow(
          AuthenticationError
        );
      });

      test('Will fail with an expired token', async () => {
        const headers = await createHeaders({ expireTime: Date.now() - 1000 });
        await expect(instance.authenticate(headers)).rejects.toThrow(JWTExpired);
      });

      test('Will fail with a Not Before time in the future', async () => {
        const headers = await createHeaders({ notBeforeTime: Date.now() + 60000 });
        await expect(instance.authenticate(headers)).rejects.toThrow(JWTClaimValidationFailed);
      });

      test('Will fail with an algorithm other than RS256', async () => {
        const headers = await createHeaders({ headers: { alg: 'RS512' } });
        await expect(instance.authenticate(headers)).rejects.toThrow(JOSEAlgNotAllowed);
      });

      test('Will fail with an invalid audience', async () => {
        const headers = await createHeaders({ audience: 'invalid' });
        await expect(instance.authenticate(headers)).rejects.toThrow(JWTClaimValidationFailed);
      });

      test('will fail with an invalid issuer', async () => {
        const headers = await createHeaders({ issuer: 'invalid' });
        await expect(instance.authenticate(headers)).rejects.toThrow(JWTClaimValidationFailed);
      });

      test('Will fail without valid subject claim', async () => {
        const headers = await createHeaders({ subject: '' });
        await expect(instance.authenticate(headers)).rejects.toThrow(AuthenticationError);
      });

      test('Will fail if Signature does not match Public Key', async () => {
        const { publicKey } = await generateKeyPair('RS256');
        const headers = await createHeaders({ publicKey });
        await expect(instance.authenticate(headers)).rejects.toThrow(
          JWSSignatureVerificationFailed
        );
      });
    });
  });

  describe('Private methods', () => {
    test('Extra Token will succeed and return the token value', () => {
      expect(instance['extractToken']('Bearer ABC')).toBe('ABC');
    });

    test('Extract Token will fail given a bad token', () => {
      expect(() => instance['extractToken']('Bearer')).toThrow(AuthenticationError);
      expect(() => instance['extractToken']('Basic 123')).toThrow(AuthenticationError);
      expect(() => instance['extractToken']('')).toThrow(AuthenticationError);
      expect(() => instance['extractToken']()).toThrow(AuthenticationError);
    });
  });
});
