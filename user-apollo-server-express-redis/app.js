const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { RedisPubSub } = require('graphql-redis-subscriptions');
const Redis = require('ioredis');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolver');

(async function startApolloServer(typeDefs, resolvers) {
  // Required logic for integrating with Express
  const app = express();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  //Creating redis pubsub
  const options = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? process.env.REDIS_PORT : '6379',
    retryStrategy: (times) => {
      // reconnect after
      return Math.min(times * 50, 2000);
    },
  };

  const pubsub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  });

  //Connect to mongodb local instance

  mongoose.connect(
    'mongodb://localhost/user_db',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    () => {
      console.log('user_db DB connected');
    }
  );

  // Same ApolloServer initialization as before, plus the drain plugin.
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res, pubsub }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      // This is the `schema` we just created.
      schema,
      // These are imported from `graphql`.
      execute,
      subscribe,
      async onConnect(connectionParams, webSocket, context) {
        console.log('Connected!');
        // If an object is returned here, it will be passed as the `context`
        // argument to your subscription resolvers.
        return {
          pubsub,
        };
      },
      onDisconnect(webSocket, context) {
        console.log('Disconnected!');
      },
    },
    {
      // This is the `httpServer` we created in a previous step.
      server: httpServer,
      // This `server` is the instance returned from `new ApolloServer`.
      path: server.graphqlPath,
    }
  );

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
  });

  // Modified server startup
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`???? Server ready at http://localhost:4000${server.graphqlPath}`);
})(typeDefs, resolvers);


console.log('it was ')