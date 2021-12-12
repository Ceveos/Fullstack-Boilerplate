import { ApolloServer } from 'apollo-server-micro'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { applyMiddleware } from 'graphql-middleware'
import cors from 'micro-cors'
import { permissions } from '../../graphql/permissions'
import { schema } from '../../graphql/schema'
import { createContext } from '../../graphql/context'

export const config = {
  api: {
    bodyParser: false,
  },
}

const schemaWithMiddleware = applyMiddleware(schema, permissions);

const apolloServer = new ApolloServer({
   schema: schemaWithMiddleware,
   context: createContext
  });

let apolloServerHandler: NextApiHandler;

async function getApolloServerHandler() {
  if (!apolloServerHandler) {
    await apolloServer.start();

    apolloServerHandler = apolloServer.createHandler({
      path: '/api/graphql',
    });
  }

  return apolloServerHandler
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
  const apolloServerHandler = await getApolloServerHandler()

  if (req.method === 'OPTIONS') {
    res.end()
    return
  }
  // await runMiddleware(req, res, cors());
  return apolloServerHandler(req, res)
}


export default cors({
  allowCredentials: true,
  origin: "https://studio.apollographql.com"
})(handler as any);
