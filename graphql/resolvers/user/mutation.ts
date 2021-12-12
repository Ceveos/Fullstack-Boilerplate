import { serialize } from 'cookie';
import {mutationField, nonNull, stringArg} from 'nexus';
import { sign, verify } from 'jsonwebtoken'

const { JWT_SECRET } = process.env;

export const signupUser = mutationField('signupUser', {
    type: 'User',
    args: {
        name: stringArg(),
        avatar: nonNull(stringArg()),
    },
    resolve: (_, { name, avatar }, ctx) => {
        return ctx.prisma.user.create({
        data: {
            id: ctx.userId ?? undefined,
            name: name ?? "",
            avatar
        },
        })
    },
})

export const loginUser = mutationField('userLogin', {
    type: 'String',
    args: {
        id: stringArg(),
        name: stringArg(),
    },
    resolve: (_, { id, name }, ctx) => {
        console.log("Pre-test");
        let cookieStr = serialize('foo', 'bar', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        console.log(cookieStr);
        ctx.res.setHeader('Set-Cookie', cookieStr);
      
        return sign("hello world", JWT_SECRET!);
    },
})