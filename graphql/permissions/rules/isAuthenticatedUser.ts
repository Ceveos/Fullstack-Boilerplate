
import { rule } from 'graphql-shield'

export const isAuthenticatedUser = rule({ cache: 'contextual' })((_, __, {userId}) => {
    return Boolean(userId);
})