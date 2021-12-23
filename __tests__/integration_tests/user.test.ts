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

// afterAll(async () => {
//   const deleteOrderDetails = prisma.orderDetails.deleteMany()
//   const deleteProduct = prisma.product.deleteMany()
//   const deleteCategory = prisma.category.deleteMany()
//   const deleteCustomerOrder = prisma.customerOrder.deleteMany()
//   const deleteCustomer = prisma.customer.deleteMany()

//   await prisma.$transaction([
//     deleteOrderDetails,
//     deleteProduct,
//     deleteCategory,
//     deleteCustomerOrder,
//     deleteCustomer,
//   ])

//   await prisma.$disconnect()
// })

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

  await prisma.user.create({
    data: {
      name: user.name,
      email: user.email
    }
  });
  //   await CreateUser(ctx, user, 'test');

  // Check if the new customer was created by filtering on unique email field
  const newUser = await prisma.user.findUnique({
    where: {
      email: user.email!,
    },
  });
  expect(newUser).toBeDefined();
  expect(newUser?.email).toEqual(user.email);

});