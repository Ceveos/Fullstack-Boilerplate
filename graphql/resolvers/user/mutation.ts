import { serialize } from 'cookie';
import {mutationField, nonNull, stringArg} from 'nexus';
import { sign, verify } from 'jsonwebtoken'
import { hashPassword } from '../../utils/crypto';
import LoginInvalidError from '../../utils/errors/auth/loginInvalid';
import { ValidateUserCredentials } from '../../models';

const { JWT_SECRET } = process.env;

// When a user signs up proper (email + password)
export const signupUser = mutationField('signupUser', {
    type: 'User',
    args: {
        name: stringArg(),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
        avatar: stringArg(),
    },
    resolve: async (_, { name, email, password, avatar }, ctx) => {
        const hashedPassword = await hashPassword(password);
        return ctx.prisma.user.create({
        data: {
            name: name ?? email,
            avatar,
            email,
            password: {
                create: {
                    password: hashedPassword,
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
  
export const userLogin = mutationField('userLogin', {
    type: 'AuthPayload',
    args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
    },
    resolve: async (_, { email, password }, ctx) => {
        console.log("Pre-test");
        const user = ctx.prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!(await ValidateUserCredentials(email, password))) {
            console.log("test");
            throw new LoginInvalidError("Invalid username or password");
        }

        let cookieStr = serialize('foo', 'bar', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        console.log(cookieStr);
        ctx.res.setHeader('Set-Cookie', cookieStr);
      
        return {
            token: sign("hello world", JWT_SECRET!),
            user: {
                id: 'asd',
                name: 'test',
                email: '@ing.com',
                avatar: "asd"
            }
        } 
    },
})