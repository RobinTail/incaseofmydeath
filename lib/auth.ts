import { createHmac, randomBytes } from 'crypto';
import { db } from './db';
import type { User } from '@prisma/client';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

function base64UrlEncode(str: string) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string) {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

export function createUserToken(userId: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };

  const base64Header = base64UrlEncode(JSON.stringify(header));
  const base64Payload = base64UrlEncode(JSON.stringify(payload));

  const signature = base64UrlEncode(
    createHmac('sha256', getJwtSecret())
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  );

  return `${base64Header}.${base64Payload}.${signature}`;
}

export function verifyUserToken(token: string): { userId: number } | null {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = base64UrlEncode(
      createHmac('sha256', getJwtSecret())
        .update(`${header}.${payload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    );

    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = JSON.parse(base64UrlDecode(payload));
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  const decoded = verifyUserToken(token);
  if (!decoded) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  return user;
}

export function createOAuthState(): string {
  return randomBytes(32).toString('hex');
}
