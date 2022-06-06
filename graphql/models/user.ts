import * as NexusPrisma from 'nexus-prisma';
import * as Prisma from '@prisma/client';
import { Context } from 'graphql/context';
import { GetUserPassword } from './password';
import { hashPassword, verifyPassword } from 'graphql/utils/crypto';
import { objectType } from 'nexus';

export const Users = objectType({
  name: NexusPrisma.User.$name,
  description: NexusPrisma.User.$description,
  definition(t) {
    t.nonNull.field(NexusPrisma.User.id);
    t.field(NexusPrisma.User.name);
    t.field(NexusPrisma.User.avatar);
    t.field(NexusPrisma.User.email);
    t.field(NexusPrisma.User.Profile);
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

  return await verifyPassword(password, userPassword.password) /* hashed password */;
}

export async function CreateUser(ctx: Context, userParam: UserParam, password: string): Promise<Prisma.User> {
  const hashedPassword = await hashPassword(password);

  return await ctx.prisma.user.create({
    data: {
      ...userParam,
      Password: {
        create: {
          password: hashedPassword,
          forceChange: false
        }
      }
    },
    include: {
      Password: true
    }
  });
}