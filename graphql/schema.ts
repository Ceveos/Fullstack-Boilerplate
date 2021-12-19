import {
  connectionPlugin,
  fieldAuthorizePlugin,
  makeSchema,
  nullabilityGuardPlugin,
  queryComplexityPlugin,
} from 'nexus';
import { join } from 'path';
import * as types from './types';

const guardPlugin = nullabilityGuardPlugin({
  onGuarded({ ctx, info }) {
    // This could report to a service like Sentry, or log internally - up to you!
    console.error(
      `Error: Saw a null value for non-null field ${info.parentType.name}.${info.fieldName}'`
    );
  },
  // A map of `typeNames` to the values we want to replace with if a "null" value
  // is seen in a position it shouldn't be. These can also be provided as a config property
  // for the `objectType` / `enumType` definition, as seen below.
  fallbackValues: {
    Int: () => 0,
    String: () => '',
    ID: ({ info }) => `${info.parentType.name}:N/A`,
    Boolean: () => false,
    Float: () => 0,
  },
});

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
    queryComplexityPlugin(),
    guardPlugin
  ],
  outputs: {
    typegen: join(
      process.cwd(),
      'node_modules',
      '@types',
      'nexus-typegen',
      'index.d.ts'
    ),
    schema: join(process.cwd(), 'graphql', 'schema.graphql'),
  },
  contextType: {
    export: 'Context',
    module: join(process.cwd(), 'graphql', 'context.ts'),
  },
});
