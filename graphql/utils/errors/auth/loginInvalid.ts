import { ApolloError } from 'apollo-server-errors';

export default class LoginInvalidError extends ApolloError {
  constructor(message: string) {
    super(message, 'LOGIN_INVALID_ERROR');
    Object.defineProperty(this, 'name', { value: 'LoginInvalidError' });
  }
}