import { ApolloClient, InMemoryCache, createHttpLink, from, fromPromise, gql } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
interface RefreshTokenData {
    refreshJwt: {
      token: string
      user: {
        username: string,
        steamId: string
      }
    }
  }

interface RefreshTokenVars {
}

const REFRESH_TOKEN_MUTATION = gql`
    mutation RefreshToken {
        refreshJwt {
           token,
           user {
             steamId
             username
           }
        }
    }
  `;

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const resolvePendingRequests = () => {
  pendingRequests.map(callback => callback());
  pendingRequests = [];
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      console.log(graphQLErrors);
      for (let err of graphQLErrors) {
        switch (err.extensions.code) {
        case 'UNAUTHENTICATED':
          // error code is set to UNAUTHENTICATED
          // when AuthenticationError thrown in resolver
          let forward$;

          if (!isRefreshing) {
            isRefreshing = true;
            forward$ = fromPromise(
              GetNewToken()
                .then((token) => {
                  // Store the new tokens for your auth link
                  localStorage.setItem('token', token);
                  resolvePendingRequests();
                  return token;
                })
                .catch((e) => {
                  console.log(e);
                  pendingRequests = [];
                  localStorage.removeItem('token');
                  // location.reload();
                  return;
                })
                .finally(() => {
                  isRefreshing = false;
                })
            ).filter(value => Boolean(value));
          } else {
            // Will only emit once the Promise is resolved
            forward$ = fromPromise(
              new Promise(resolve => {
                pendingRequests.push(() => resolve(null));
              })
            );
          }

          return forward$.flatMap(() => forward(operation));
        }
      }
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
      // if you would also like to retry automatically on
      // network errors, we recommend that you use
      // apollo-link-retry
    }
  }
);

const httpLink = createHttpLink({
  uri: '/api/graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

export const GetNewToken = async () => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const { data } = await authClient.mutate<RefreshTokenData, RefreshTokenVars>({
        mutation: REFRESH_TOKEN_MUTATION
      });

      if (!data?.refreshJwt.token) {
        reject('Token not found');
        return;
      }
      resolve(data.refreshJwt.token);
    } catch (e) {
      reject('Error getting new token (invalid refresh token?)');
    }
  });
};

const authClient = new ApolloClient({
  // The `from` function combines an array of individual links
  // into a link chain
  link: from([httpLink]),
  cache: new InMemoryCache()
});

// If you provide a link chain to ApolloClient, you
// don't provide the `uri` option.
const client = new ApolloClient({
  // The `from` function combines an array of individual links
  // into a link chain
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Game: {
        keyFields: ['id']
      },
      GameDatabase: {
        keyFields: ['id']
      },
      User: {
        keyFields: ['steamId']
      }
    }
  })
});

export default client;