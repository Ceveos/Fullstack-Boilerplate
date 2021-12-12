import { shield } from 'graphql-shield'
import { isAuthenticatedUser } from './rules/isAuthenticatedUser';

export const permissions = shield({
    Query: {
        // post: isAuthenticatedUser
    }
})