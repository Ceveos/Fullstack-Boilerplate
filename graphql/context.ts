import { AuthenticationError } from 'apollo-server-micro';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { IncomingMessage, ServerResponse } from 'http';
import { JsonWebTokenError, NotBeforeError, TokenExpiredError, sign, verify } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { UserToken } from './models/userToken';
import { assert } from './utils/assert';
import { prisma } from '../db';

export type Context = {
  req: IncomingMessage;
  res: ServerResponse;
  prisma: PrismaClient;
  token: UserToken | null;
}

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
  token: UserToken | null;
}

export const tokens = {
  access: {
    name:   'ACCESS_TOKEN',
    expiry: '1d',
  },
};

export function getIpAddress(ctx: Context): string {
  const ip = (ctx.req.headers['x-forwarded-for'] as string)?.split(',').shift() ||
  ctx.req.socket.remoteAddress!;
  return ip;
}

export function userIdentifier(ctx: Context): string {
  const ip = getIpAddress(ctx);
  console.log(`IP Address: ${ip} | user id: ${ctx.token?.userId}`);
  return ctx.token?.userId ?? ip;
}

export interface Token {
  userId: number
  type: string
  timestamp: number
}

interface IncomingContext {
  req: NextApiRequest// IncomingMessage;
  res: NextApiResponse// ServerResponse;
}

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
    token:  null
  };
};

export const createContext = (ctx: IncomingContext): Context => {
  const { JWT_SECRET } = process.env;
  const {req, res} = ctx;
  const authorization = req?.headers?.authorization ?? '';

  assert(JWT_SECRET, 'Missing JWT_SECRET environment variable');

  // console.log(req.cookies);

  // console.log(`Authorization: ${authorization}`);

  const tokenStr = authorization.replace('Bearer ', '');
  let token: UserToken | null;
  try {
    token = verify(tokenStr, JWT_SECRET) as UserToken;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AuthenticationError('Token is expired');
    }
    else if (error instanceof JsonWebTokenError) {
      throw new AuthenticationError('Error parsing token');
    }
    else if (error instanceof NotBeforeError) {
      throw new AuthenticationError('Token not yet valid');
    } else {
    }
    token = null;
  }

  // const verifiedToken = verify(token, JWT_SECRET) as Token

  // if (!verifiedToken.userId && verifiedToken.type !== tokens.access.name)
  // userId = -1
  // else userId = verifiedToken.userId
  return {
    ...ctx,
    prisma,
    token
  };
};