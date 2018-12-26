const { makeExecutableSchema, RenameRootFields, transformSchema } = require('graphql-tools');
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { createServer } = require('http');
const app = express();
const server = createServer(app);
const { PubSub } = require('apollo-server');

const pubsub = new PubSub();

const COUNTER_INCREMENT_TOPIC = 'counter_increment';
let counter = 0;

setInterval(() => {
    pubsub.publish(COUNTER_INCREMENT_TOPIC, { prefix_counterIncrement: { value: counter += 1 } });
}, 1000);

const resolvers = {
  Subscription: {
    counterIncrement: {
      subscribe: () => {
        console.log('SUBSCRIBED')
        return pubsub.asyncIterator(COUNTER_INCREMENT_TOPIC)
      },
    },
  },
  Query: {
    currentCount: () => ({ value: counter }),
  },
};

const typeDefs = gql`
  type CounterValue {
    value: Int!
  }

  type Subscription {
    counterIncrement: CounterValue
  }

  type Query {
      currentCount: CounterValue
  }
`;

const schema = transformSchema(
  makeExecutableSchema({ typeDefs, resolvers }),
  [
    new RenameRootFields((_operation, name) => `prefix_${name}`),
    // new RenameRootFields((_operation, name) => name), // will work
  ],
);

const apollo = new ApolloServer({
  schema,
  subscriptions: {
    path: '/ws/subscriptions'
  }
})

apollo.applyMiddleware({ app, path: '/api/graphql' })
apollo.installSubscriptionHandlers(server)

server.listen(8484)

