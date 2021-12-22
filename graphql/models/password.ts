import * as Prisma from '@prisma/client';
import * as NexusPrisma from 'nexus-prisma';
import { Context } from '../context';

export async function GetUserPassword(ctx: Context, user: Prisma.User): Promise<Prisma.UserPassword | null> {
  return await ctx.prisma.userPassword.findUnique({
    where: {
      id: user.id
    }
  });
}

export function ValidatePassword(password: Prisma.UserPassword): boolean
{
  return true;
}