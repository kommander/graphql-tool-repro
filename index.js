const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const app = express();

const typeDefs1 = gql`
  enum AllowedColor {
    RED
    GREEN
    BLUE
  }

  type Query {
    favoriteColor: AllowedColor # As a return value
    avatar(borderColor: AllowedColor): String # As an argument
  }
`;

const resolvers1 = {
  // AllowedColor: {
  //   RED: '#f00',
  //   GREEN: '#0f0',
  //   BLUE: '#00f'
  // },
  Query: {
    favoriteColor: () => 'RED',
    avatar: (parent, args) => {
      return `${JSON.stringify(args)}`
    }
  }
}


const schema1 = makeExecutableSchema({
  typeDefs: typeDefs1,
  resolvers: resolvers1
});

const merged = mergeSchemas({
  schemas: [schema1]
});

const server = new ApolloServer({
  schema: merged,
})

server.applyMiddleware({ app, path: '/api/graphql' })

app.listen(8484)

