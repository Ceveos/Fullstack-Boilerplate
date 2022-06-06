import { AuthenticationError } from 'apollo-server-micro';
import { CreateJWTForUser, CreateRefreshTokenForUser, CreateUser, GetAuthCookie, GetUserByEmail, GetUserByRefreshToken, UpdateRefreshToken, UserParam, ValidateUserCredentials } from 'graphql/models';
import { mutationField, nonNull, stringArg } from 'nexus';
import { parse, serialize } from 'cookie';
import LoginInvalidError from 'graphql/utils/errors/auth/loginInvalid';

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

    if (user === null || !(await ValidateUserCredentials(ctx, user, password))) {
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

// When a user is asking to refresh their jwt due to expiry
export const refreshJwt = mutationField('refreshJwt', {
  type: 'AuthPayload',
  resolve: async (_, {}, ctx) => {
    console.log('Refreshing JWT');

    if (!ctx.req.headers.cookie) {
      throw new AuthenticationError('No cookies found');
    }

    const refreshToken = parse(ctx.req.headers.cookie)['refresh_token'];

    if (!refreshToken) {
      throw new AuthenticationError('No refresh token found');
    }

    const user = await GetUserByRefreshToken(ctx, refreshToken);

    if (!user) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Update expiry date of both refresh token (in db) and user cookie
    await UpdateRefreshToken(ctx, refreshToken);
    ctx.res.setHeader('Set-Cookie', GetAuthCookie(refreshToken));

    // Create new JWT for user
    const token = CreateJWTForUser(user);

    return {
      token,
      user
    };
  },
});