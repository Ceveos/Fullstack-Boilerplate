import * as Prisma from '@prisma/client';
import { Context, MockContext, createMockContext } from '../../context';
import { CreateUser, UserParam } from '../../models';

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

test('should create new user', async () => {
  const userParam: UserParam = {
    name:   'Rich',
    email:  'hello@prisma.io',
    avatar: null
  };
  const user: Prisma.User = {
    ...userParam,
    emailConfirmed: false,
    id:             '1',
    role:           'USER',
  };

  mockCtx.prisma.user.create.mockResolvedValue(user);
  await expect(CreateUser(ctx, user, 'test')).resolves.toMatchObject(user);
});