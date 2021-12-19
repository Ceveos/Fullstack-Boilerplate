import { serialize } from 'cookie';
import {mutationField, nonNull, stringArg} from 'nexus';
import { hashPassword } from '../../utils/crypto';
import LoginInvalidError from '../../utils/errors/auth/loginInvalid';
import { CreateJWTForUser, CreateRefreshTokenForUser, GetUserByEmail, ValidateUserCredentials } from '../../models';

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
        const user = await GetUserByEmail(email);

        if (user == null || !(await ValidateUserCredentials(user, password))) {
            throw new LoginInvalidError("Invalid username or password");
        }

        const refreshToken = await CreateRefreshTokenForUser(user);
        const token = CreateJWTForUser(user);

        const cookieStr = serialize('refresh_token', refreshToken.hash, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 60 * 60 * 24 * 7 * 2 // 2 weeks
        });

        console.log(cookieStr);
        ctx.res.setHeader('Set-Cookie', cookieStr);

        return {
            token,
            user
        }
    },
})