import { ApolloServer } from 'apollo-server-micro';
import { BaseContext } from 'next/dist/shared/lib/utils';
import { GraphQLRequestContext, PluginDefinition } from 'apollo-server-core';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { applyMiddleware } from 'graphql-middleware';
import { createContext } from 'graphql/context';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';
import { permissions } from 'graphql/permissions';
import { schema } from 'graphql/schema';
import { separateOperations } from 'graphql';
import cors from 'micro-cors';
import depthLimit from 'graphql-depth-limit';

export const config = {
  api: {
    bodyParser: false,
  },
};

const schemaWithMiddleware = applyMiddleware(schema, permissions);

const complexityPlugin: PluginDefinition = {
  async requestDidStart() {
    return {
      async didResolveOperation({request, document}: GraphQLRequestContext<BaseContext>): Promise<void> {
        const complexity = getComplexity({
          schema,
          query: request.operationName ?
            separateOperations(document!)[request.operationName] :
                    document!,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({defaultComplexity: 1})
          ]
        });

        if (complexity >= 500) {
          throw new Error(
            `Complexity (${complexity}) is over the 500 maximum allowed.`,
          );
        };
      },
    };
  },
};

const apolloServer = new ApolloServer({
  schema: schemaWithMiddleware,
  context: createContext,
  validationRules: [
    depthLimit(3)
  ],
  plugins: [
    complexityPlugin,
  ]
});

let apolloServerHandler: NextApiHandler;

async function getApolloServerHandler() {
  if (!apolloServerHandler) {
    await apolloServer.start();

    apolloServerHandler = apolloServer.createHandler({
      path: '/api/graphql',
    });
  }

  return apolloServerHandler;
}

// // Helper method to wait for a middleware to execute before continuing
// // And to throw an error when an error happens in a middleware
// function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) {
//         return reject(result)
//       }

//       return resolve(result)
//     })
//   })
// }

const handler: NextApiHandler = async (req, res) => {
  const apolloServerHandler = await getApolloServerHandler();

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  // await runMiddleware(req, res, cors());
  return apolloServerHandler(req, res);
};

export default cors({
  allowCredentials: true,
  origin: 'https://studio.apollographql.com'
})(handler as any);
