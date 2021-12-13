import { createRateLimitRule } from 'graphql-rate-limit';
import { allow, not, shield } from 'graphql-shield'
import { Context, userIdentifier } from '../context';
import { isAuthenticatedUser } from './rules/isAuthenticatedUser';


const rateLimitRule = createRateLimitRule({ identifyContext: (ctx: Context) => userIdentifier(ctx) })

export const permissions = shield({
    Query: {
        '*': rateLimitRule({window: "1s", max: 5})
    }
})