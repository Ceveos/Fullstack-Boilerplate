import { ClearDatabase, prisma } from '../../../../db';
import { Context } from '../../../context';
import { CreateUser, UserParam } from '../../../models';

beforeAll(async () => {
  await ClearDatabase();
});

const ctx: Context = {
  prisma,
  req:   {} as unknown as any,
  res:   {} as unknown as any,
  token: null
};
const userParam: UserParam = {
  name:   'test',
  email:  'test@email.com',
  avatar: null
};
const anotherUserParam: UserParam = {
  name:   'test 2',
  email:  'test2@email.com',
  avatar: null
};
const password = 'test';

describe('User Registration', () => {
  it('should create user when registered', async () => {
    const user = await CreateUser(ctx, userParam, password);

    expect(user).toBeDefined();

    // Check if the new customer was created by filtering on unique email field
    const newUser = await prisma.user.findUnique({
      where: {
        email: user.email!,
      },
    });

    expect(newUser).toBeDefined();
    expect(newUser).toMatchObject(userParam);
    expect(user).toMatchObject(newUser!);
  });

  it('should error when creating existing user', async () => {
    // Expect error to be thrown when re-creating user
    await expect(CreateUser(ctx, userParam, password)).rejects.toThrowError();
  });

  it('should allow creation of a second, different user', async () => {
    // Expect error to be thrown when re-creating user
    await expect(CreateUser(ctx, anotherUserParam, password)).resolves.toMatchObject(anotherUserParam);
  });
});