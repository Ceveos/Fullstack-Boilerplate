import * as Prisma from '@prisma/client';
import { ClearDatabase, prisma } from 'db';
import { Context } from 'graphql/context';
import { CreateJWTForUser, CreateRefreshTokenForUser, CreateUser, GetUserByRefreshToken, UpdateRefreshToken, UserParam, ValidateUserCredentials } from 'graphql/models';
import { UserToken } from 'graphql/models/userToken';
import { verify } from 'jsonwebtoken';

const { JWT_SECRET } = process.env;
const ctx: Context = {
  prisma,
  req: {} as unknown as any,
  res: {} as unknown as any,
  token: null
};
const userParam: UserParam = {
  name: 'test',
  email: 'test@email.com',
  avatar: null
};
const password = 'test';

let user: Prisma.User;

describe('User Sign-in', () => {
  beforeAll(async () => {
    await ClearDatabase();
    user = await CreateUser(ctx, userParam, password);;
  });

  beforeEach(() => {
    expect(user).toBeDefined();
  });

  afterEach(async () => {
    await prisma.refreshToken.deleteMany({where: {}});
  });

  it('should return a valid refresh token on sign-in', async () => {
    const refreshToken = await CreateRefreshTokenForUser(ctx, user);

    expect(refreshToken).toBeDefined();
    expect(refreshToken.hash).toEqual(expect.any(String));
  });

  it('should create unique refresh tokens per sign-in', async () => {
    const refreshToken1 = await CreateRefreshTokenForUser(ctx, user);
    const refreshToken2 = await CreateRefreshTokenForUser(ctx, user);

    expect(refreshToken1).toBeDefined();
    expect(refreshToken1.hash).toEqual(expect.any(String));
    expect(refreshToken2).toBeDefined();
    expect(refreshToken2.hash).toEqual(expect.any(String));

    expect(refreshToken1.hash).not.toMatch(refreshToken2.hash);
  });

  it('should return user from a valid refresh token', async () => {
    const refreshToken = await CreateRefreshTokenForUser(ctx, user);

    const userFromToken = await GetUserByRefreshToken(ctx, refreshToken.hash);

    expect(userFromToken).toBeDefined();

    expect(user).toMatchObject(userFromToken!);
  });

  it('should return a valid JWT for a user', async () => {
    const tokenStr = CreateJWTForUser(user);

    expect(tokenStr).toEqual(expect.any(String));

    expect(JWT_SECRET).toEqual(expect.any(String));
    const token = verify(tokenStr, JWT_SECRET!) as UserToken;

    expect(token).toBeDefined();
    expect(token.userId).toEqual(user.id);
    expect(token.email).toEqual(user.email);
  });
});