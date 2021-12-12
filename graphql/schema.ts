import { connectionPlugin, fieldAuthorizePlugin, makeSchema } from 'nexus'
import { join } from 'path'

import * as types from './types';

export const schema = makeSchema({
    types,
    plugins: [
      fieldAuthorizePlugin({
        formatError: (authConfig) => authConfig.error,
      }),
      connectionPlugin({
        cursorFromNode(node) {
          return node.id;
        },
      }),
    ],
    outputs: {
        typegen: join(process.cwd(), 'node_modules', '@types', 'nexus-typegen', 'index.d.ts'),
        schema: join(process.cwd(), 'graphql', 'schema.graphql'),
    },
    contextType: {
      export: 'Context',
      module: join(process.cwd(), 'graphql', 'context.ts'),
    },
  });