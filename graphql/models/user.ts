import { objectType } from 'nexus';
import * as Prisma from '@prisma/client';
import * as NexusPrisma from 'nexus-prisma';
import { prisma } from '../../db';
import { verifyPassword } from '../utils/crypto';
import { GetUserPassword } from './password';
import cryptoRandomString from 'crypto-random-string';
import { sign } from 'jsonwebtoken';

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

export async function ValidateUserCredentials(user: Prisma.User, password: string): Promise<boolean> {
  const userPassword = await GetUserPassword(user);
  if (userPassword == null) {
    return false;
  }

  return await verifyPassword(password, userPassword.password);
}

export async function CreateRefreshTokenForUser(user: Prisma.User): Promise<Prisma.RefreshToken> {
  let hash = cryptoRandomString({length: 100, type: 'base64'});
  var expiration = new Date();
  expiration.setDate(expiration.getDate() + 14);
  return await prisma.refreshToken.create({
      data: {
          expiration,
          hash,
          label: "Login",
          userId: user.id,
      }
  })
}

export function CreateJWTForUser(user: Prisma.User): string {
  const { JWT_SECRET } = process.env;
  return sign(user, JWT_SECRET!, {
    expiresIn: "10m"
  });
}