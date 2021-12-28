import { CreateJWTForUser, CreateRefreshTokenForUser, CreateUser, GetUserByEmail, UserParam, ValidateUserCredentials } from '../../models';
import {mutationField, nonNull, stringArg} from 'nexus';
import { serialize } from 'cookie';
import LoginInvalidError from '../../utils/errors/auth/loginInvalid';

// When a user signs up proper (email + password)
export const createUser = mutationField('signupUser', {
  type: 'User',
  args: {
    name: stringArg(),
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
    avatar: stringArg(),
  },
  resolve: async (_, { name, email, password, avatar }, ctx) => {
    const userParam: UserParam = {
      avatar: avatar ?? null,
      email,
      name: name ?? email
    };

    return await CreateUser(ctx, userParam, password);
  },
});

export const userLogin = mutationField('userLogin', {
  type: 'AuthPayload',
  args: {
    email: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  resolve: async (_, { email, password }, ctx) => {
    const user = await GetUserByEmail(ctx, email);

    if (user == null || !(await ValidateUserCredentials(ctx, user, password))) {
      throw new LoginInvalidError('Invalid username or password');
    }

    const refreshToken = await CreateRefreshTokenForUser(ctx, user);
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
    };
  },
});