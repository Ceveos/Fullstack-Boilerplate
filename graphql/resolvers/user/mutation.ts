import { serialize } from 'cookie';
import {mutationField, nonNull, stringArg} from 'nexus';
import { sign, verify } from 'jsonwebtoken'
import { hashPassword } from '../../utils/crypto';

const { JWT_SECRET } = process.env;

// When a user signs up proper (email + password)
export const signupUser = mutationField('signupUser', {
    type: 'User',
    args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        avatar: nonNull(stringArg()),

    },
    resolve: (_, { name, email, password, avatar }, ctx) => {
        
        return ctx.prisma.user.create({
        data: {
            name: name ?? email,
            avatar,
            email,
            password: {
                create: {
                    password: hashPassword(password),
                    forceChange: false
                }
            }
        },
        include: {
            password: true
        }
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