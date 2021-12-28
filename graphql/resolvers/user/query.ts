import { list, nonNull, nullable, queryField, queryType, stringArg} from 'nexus';

export const getUser = queryField('user', {
  type: 'User',
  args: {
    userId: nonNull(stringArg()),
  },
  resolve: (_, args, ctx) => {
    return ctx.prisma.user.findUnique({
      where: { id: args.userId },
    });
  },
});
