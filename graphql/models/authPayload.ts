import { objectType } from 'nexus';

export const AuthPayload = objectType({
  name: 'AuthPayload',
  description: 'Payload containing auth token',
  definition(t) {
    t.nonNull.string('token');
    t.field('user', {type: 'User'});
  },
});