import * as NexusPrisma from 'nexus-prisma';
import { objectType } from 'nexus';
import { prisma } from '../../db';

export const Profile = objectType({
  name: NexusPrisma.Profile.$name,
  description: NexusPrisma.Profile.$description,
  definition(t) {
    t.field(NexusPrisma.Profile.id);
    t.field(NexusPrisma.Profile.bio);
    t.field(NexusPrisma.Profile.user);
    t.nullable.field('user', {
      type: 'User',
      resolve: (parent) =>
        prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .user(),
    });
  }
});