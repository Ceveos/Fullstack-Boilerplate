import { Context } from '../../../context';
import { CreateUser, UserParam } from '../../../models';
import { prisma } from '../../../../db';

beforeAll(async () => {
  const tablenames =
    await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }

  await prisma.$disconnect();
});

const ctx: Context = {
  prisma,
  req:   {} as unknown as any,
  res:   {} as unknown as any,
  token: null
};
const userParam: UserParam = {
  name:   'Rich',
  email:  'hello@prisma.io',
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
    // // Expect user when initially registering account
    // await expect(CreateUser(ctx, userParam, password)).resolves.toBeDefined();

    // Expect error to be thrown when re-creating user
    await expect(CreateUser(ctx, userParam, password)).rejects.toThrowError();
  });
});