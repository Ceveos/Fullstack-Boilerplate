import { Context, MockContext, createMockContext } from '../../graphql/context';
import { CreateUser, UserParam } from '../../graphql/models';

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

test('should create new user ', async () => {
  const user: UserParam  = {
    name: 'Rich',
    email: 'hello@prisma.io',
    avatar: null
  };

  await expect(CreateUser(ctx, user, 'test')).resolves.toEqual({
    id: 1,
    name: 'Rich',
    email: 'hello@prisma.io',
  });
});

// test('should fail if user does not accept terms', async () => {
//   const user = {
//     id: 1,
//     name: 'Rich Haines',
//     email: 'hello@prisma.io',
//     acceptTermsAndConditions: false,
//   };

//   mockCtx.prisma.user.create.mockRejectedValue(
//     new Error('User must accept terms!')
//   );

//   await expect(createUser(user, ctx.prisma)).resolves.toEqual(
//     new Error('User must accept terms!')
//   );
// });