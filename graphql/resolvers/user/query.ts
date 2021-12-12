import { list, nonNull, nullable, queryField, stringArg} from 'nexus';

export const getUser = queryField('user', {
    type: 'User',
    args: {
        userId: nullable(stringArg()),
    },
    resolve: (_, args, ctx) => {
        return ctx.prisma.user.findUnique({
          where: { id: args.userId ?? undefined },
        })
    },
});
