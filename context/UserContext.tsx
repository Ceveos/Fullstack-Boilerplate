import { GetNewToken } from './ApolloContext';
import { UserToken } from 'graphql/models/userToken';
import { decode } from 'jsonwebtoken';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export type UserContextType = {
    loaded: boolean
    user?: UserToken;
    haveToken(): boolean;
    // eslint-disable-next-line no-unused-vars
    login(jwt: string): void;
    logout(): void;
}

const userContextDefaultValues: UserContextType = {
  loaded: false,
  haveToken: () => {return false;},
  login: () => {},
  logout: () => {}
};

const UserContext = createContext<UserContextType>(userContextDefaultValues);

interface UserContextWrapProps {
  children?: React.ReactNode;
}

export const UserContextWrapper: React.FC<UserContextWrapProps> = ({ children }) => {
  var [loaded, setLoaded] = useState(false);
  var [user, setUser] = useState<UserToken>();

  const haveToken = () => {
    return localStorage.getItem('token') !== null;
  };

  const login = useCallback (async (jwt: string, updateStorage = true) => {
    console.log('Running log in');
    try {
      let userDecoded = decode(jwt, {complete: true});

      // If we could not decode the user token, lets try to get a new one
      if (!userDecoded) {
        userDecoded = decode(await GetNewToken(), {complete: true});
      }

      if (userDecoded) {
        if (updateStorage) {
          localStorage.setItem('token', jwt);
        }
        setUser(userDecoded.payload as UserToken);
      } else {
        throw new Error();
      }
    } catch (error) {
      // If we have an error parsing a JWT,
      // we are in a bad state. Log out.
      logout();
    }
    setLoaded(true);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(undefined);
    setLoaded(true);
  };

  useEffect(() => {
    if (loaded) {
      return;
    }

    const jwt = localStorage.getItem('token');

    if (jwt) {
      login(jwt, false);
    } else {
      setLoaded(true);
    }
  }, [loaded, login]);

  const value: UserContextType = {user, loaded, haveToken, login, logout};

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;