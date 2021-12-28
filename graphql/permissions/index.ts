import { Context, userIdentifier } from 'graphql/context';
import { allow, not, shield } from 'graphql-shield';
import { createRateLimitRule } from 'graphql-rate-limit';
import { isAuthenticatedUser } from './rules/isAuthenticatedUser';

const rateLimitRule = createRateLimitRule({ identifyContext: (ctx: Context) => userIdentifier(ctx) });

export const permissions = shield({
  Query: {
    '*': rateLimitRule({window: '1s', max: 5})
  },
  Mutation: {
    '*': rateLimitRule({window: '1s', max: 5})
  }
},
{
  allowExternalErrors: true
});