import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  id: string;
  role: string;
  type: 'access' | 'refresh';
}

const secret = (kind: 'access' | 'refresh'): string => {
  const value = process.env[kind === 'access' ? 'JWT_ACCESS_SECRET' : 'JWT_REFRESH_SECRET'];
  if (!value) throw new Error(`JWT_${kind.toUpperCase()}_SECRET is required`);
  return value;
};

export const generateAccessToken = (id: string, role: string): string =>
  jwt.sign({ id, role, type: 'access' }, secret('access'), {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as SignOptions['expiresIn'],
  });

export const generateRefreshToken = (id: string, role: string): string =>
  jwt.sign({ id, role, type: 'refresh' }, secret('refresh'), {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as SignOptions['expiresIn'],
  });

export const verifyToken = (token: string, kind: 'access' | 'refresh' = 'access'): TokenPayload => {
  const payload = jwt.verify(token, secret(kind)) as TokenPayload;
  if (payload.type !== kind) throw new Error('Invalid token type');
  return payload;
};
