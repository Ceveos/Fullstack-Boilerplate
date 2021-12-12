import { objectType } from 'nexus'
import * as NexusPrisma from 'nexus-prisma'
import { prisma } from '../../db'

export const User = objectType({
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
  })