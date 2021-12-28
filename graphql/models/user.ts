import * as NexusPrisma from 'nexus-prisma';
import * as Prisma from '@prisma/client';
import { Context } from '../context';
import { GetUserPassword } from './password';
import { UserToken } from './userToken';
import { assert } from '../utils/assert';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { objectType } from 'nexus';
import { sign } from 'jsonwebtoken';
import srs from 'secure-random-string';

export const Users = objectType({
  name:        NexusPrisma.User.$name,
  description: NexusPrisma.User.$description,
  definition(t) {
    t.field(NexusPrisma.User.id);
    t.field(NexusPrisma.User.name);
    t.field(NexusPrisma.User.avatar);
    t.field(NexusPrisma.User.email);
    t.field(NexusPrisma.User.profile);
    // t.list.field('posts', {
    //   type: 'Post',
    //   resolve: (parent) =>
    //     prisma.user
    //       .findUnique({
    //         where: { id: parent.id },
    //       })
    //       .posts(),
    // })
  },
});

export type UserParam = Pick<Prisma.User, 'avatar' | 'email' | 'name'>

export async function GetUserByEmail(ctx: Context, email: string): Promise<Prisma.User | null> {
  return await ctx.prisma.user.findUnique({
    where: {
      email
    }
  });
}

export async function ValidateUserCredentials(ctx: Context, user: Prisma.User, password: string): Promise<boolean> {
  const userPassword = await GetUserPassword(ctx, user);

  if (userPassword == null) {
    return false;
  }

  return await verifyPassword(password, userPassword.password);
}

export async function CreateUser(ctx: Context, userParam: UserParam, password: string): Promise<Prisma.User> {
  const hashedPassword = await hashPassword(password);

  return await ctx.prisma.user.create({
    data: {
      ...userParam,
      password: {
        create: {
          password:    hashedPassword,
          forceChange: false
        }
      }
    },
    include: {
      password: true
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
      label:  'Login',
      userId: user.id,
    }
  });
}

export function CreateJWTForUser(user: Prisma.User): string {
  const { JWT_SECRET } = process.env;

  assert(JWT_SECRET, 'Missing JWT_SECRET environment variable');

  const token: UserToken = {
    userId: user.id
  };

  return sign(token, JWT_SECRET, {
    expiresIn: '10m'
  });
}