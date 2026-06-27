import { SignJWT } from 'jose';

const JWT_SECRET_ENV = 'JWT_SECRET';

export const ensureJwtSecret = () => {
  const secret = process.env[JWT_SECRET_ENV];

  if (!secret) {
    throw new Error(`Missing required environment variable: ${JWT_SECRET_ENV}`);
  }

  return secret;
};

export const signToken = async (payload: { sub: string; email: string }) => {
  const secret = ensureJwtSecret();
  const secretBytes = new TextEncoder().encode(secret);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretBytes);
};
