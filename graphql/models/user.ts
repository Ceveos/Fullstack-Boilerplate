import { objectType } from 'nexus';
import * as Prisma from '@prisma/client';
import * as NexusPrisma from 'nexus-prisma';
import { prisma } from '../../db';
import { verifyPassword } from '../utils/crypto';
import { GetUserPassword } from './password';

export const Users = objectType({
    name: NexusPrisma.User.$name,
    description: NexusPrisma.User.$description,
    definition(t) {
      t.field(NexusPrisma.User.id)
      t.field(NexusPrisma.User.name)
      t.field(NexusPrisma.User.avatar)
      t.field(NexusPrisma.User.email)
      t.field(NexusPrisma.User.profile)
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

export async function GetUserByEmail(email: string): Promise<Prisma.User | null> { 
  return await prisma.user.findUnique({
    where: {
        email
    }
  });
}

export async function ValidateUserCredentials(email: string, password: string): Promise<boolean> {
  const user = await GetUserByEmail(email);
  if (user == null) {
      return false;
  }

  const userPassword = await GetUserPassword(user);
  if (userPassword == null) {
    return false;
  }

  return await verifyPassword(password, userPassword.password);
}
