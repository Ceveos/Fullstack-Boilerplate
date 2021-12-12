import { allow, not, shield } from 'graphql-shield'
import { isAuthenticatedUser } from './rules/isAuthenticatedUser';

export const permissions = shield({
    Query: {
        '*': allow //not(isAuthenticatedUser)
    }
})