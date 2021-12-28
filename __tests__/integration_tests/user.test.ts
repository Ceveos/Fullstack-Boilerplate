import { prisma } from '../../db';
import { Context } from '../../graphql/context';
import { CreateUser, UserParam } from '../../graphql/models';

// beforeAll(async () => {
//   // create product categories
//   await prisma.category.createMany({
//     data: [{ name: 'Wand' }, { name: 'Broomstick' }],
//   })

//   console.log('✨ 2 categories successfully created!')

//   // create products
//   await prisma.product.createMany({
//     data: [
//       {
//         name: 'Holly, 11", phoenix feather',
//         description: 'Harry Potters wand',
//         price: 100,
//         sku: 1,
//         categoryId: 1,
//       },
//       {
//         name: 'Nimbus 2000',
//         description: 'Harry Potters broom',
//         price: 500,
//         sku: 2,
//         categoryId: 2,
//       },
//     ],
//   })

//   console.log('✨ 2 products successfully created!')

//   // create the customer
//   await prisma.customer.create({
//     data: {
//       name: 'Harry Potter',
//       email: 'harry@hogwarts.io',
//       address: '4 Privet Drive',
//     },
//   })

//   console.log('✨ 1 customer successfully created!')
// })

afterAll(async () => {
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
  // const deleteUserPasswords = prisma.userPassword.deleteMany();
  // const deleteUsers = prisma.user.deleteMany();

  // await prisma.$transaction([
  //   deleteUserPasswords,
  //   deleteUsers,
  // ]);

  await prisma.$disconnect();
});

it('should create user when registered', async () => {
  // The new customers details
  const user: UserParam  = {
    name: 'Rich',
    email: 'hello@prisma.io',
    avatar: null
  };
  const ctx: Context = {
    prisma,
    req: {} as unknown as any,
    res: {} as unknown as any,
    token: null
  };

  await CreateUser(ctx, user, 'test');

  // Check if the new customer was created by filtering on unique email field
  const newUser = await prisma.user.findUnique({
    where: {
      email: user.email!,
    },
  });
  expect(newUser).toBeDefined();
  expect(newUser?.email).toEqual(user.email);

});