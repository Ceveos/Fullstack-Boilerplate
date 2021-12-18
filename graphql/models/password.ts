import * as Prisma from '@prisma/client';
import * as NexusPrisma from 'nexus-prisma'
import { prisma } from '../../db'

export async function GetUserPassword(user: Prisma.User): Promise<Prisma.UserPassword | null> { 
    return await prisma.userPassword.findUnique({
      where: {
          id: user.id
      }
    });
}

export function ValidatePassword(password: Prisma.UserPassword): boolean
{ 
  return true;
}