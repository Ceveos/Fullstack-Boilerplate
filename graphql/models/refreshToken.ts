import * as NexusPrisma from 'nexus-prisma';
import * as Prisma from '@prisma/client';
import { Context } from 'graphql/context';
import { UserToken } from './userToken';
import { assert } from 'graphql/utils/assert';
import { objectType } from 'nexus';
import { serialize } from 'cookie';
import { sign } from 'jsonwebtoken';
import srs from 'secure-random-string';

export const RefershTokens = objectType({
  name: NexusPrisma.RefreshToken.$name,
  description: NexusPrisma.RefreshToken.$description,
  definition(t) {
    t.nonNull.field(NexusPrisma.RefreshToken.User);
    t.nonNull.field(NexusPrisma.RefreshToken.hash);
    t.nonNull.field(NexusPrisma.RefreshToken.expiration);
    t.nonNull.field(NexusPrisma.RefreshToken.valid);
  },
});

export async function GetUserByRefreshToken(ctx: Context, refreshToken: string): Promise<Prisma.User | null> {
  let refreshTokenItem = await ctx.prisma.refreshToken.findUnique({
    where: {
      hash: refreshToken
    },
    select: {
      User: true,
      valid: true,
      expiration: true
    }
  });

  // Refresh token not in database
  if (!refreshTokenItem) {
    return null;
  }

  // Refresh token invalid / expired
  if (!refreshTokenItem.valid || new Date() > refreshTokenItem.expiration) {
    await ctx.prisma.refreshToken.delete({
      where: {
        hash: refreshToken
      }
    });
    return null;
  }

  return refreshTokenItem.User;
}

export async function UpdateRefreshToken(ctx: Context, refreshToken: string) {
  var expiration = new Date();

  expiration.setDate(expiration.getDate() + 14);
  return await ctx.prisma.refreshToken.update({
    where: {
      hash: refreshToken
    },
    data: {
      expiration
    }
  });
}

export async function CreateRefreshTokenForUser(ctx: Context, user: Prisma.User): Promise<Prisma.RefreshToken> {
  let hash = srs({length: 100});
  var expiration = new Date();

  expiration.setDate(expiration.getDate() + 14);
  return await ctx.prisma.refreshToken.create({
    data: {
      expiration,
      hash,
      label: 'Login',
      userId: user.id,
    }
  });
}

export function GetAuthCookie(refreshToken: string) {
  const sameSite = process.env.NODE_ENV === 'production' ? true : 'none';

  return serialize('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7 * 4 // 4 weeks
  });
};

export function CreateJWTForUser(user: Prisma.User): string {
  const { JWT_SECRET } = process.env;

  assert(JWT_SECRET, 'Missing JWT_SECRET environment variable');

  const token: UserToken = {
    userId: user.id,
    email: user.email ?? undefined,
  };

  return sign(token, JWT_SECRET, {
    expiresIn: '10m'
  });
}