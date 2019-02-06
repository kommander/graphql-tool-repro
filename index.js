const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');

const typeDefs1 = gql`
  type Query {
    book: Book
  }

  type Book {
    id: Int,
    title: String
  }
`;

const typeDefs2 = gql`
  type Query {
    author: Author
  }
  type Author {
    id: Int,
    name: String
  }
`;

const typeDefsExtend = gql`
  extend type Book {
    author: Author
  }
`;

const bookResolvers = {
  Query: {
    book: () => console.log('BOOOKKK') || ({ id: 1, title: 'One Book' })
  }
}

const authorResolvers = {
  Query: {
    author: () => console.log('AUTHOR') || ({ id: 1, name: 'Not the one' })
  },
  Author: {
    name: () => 'Always the same'
  }
}

const extendResolvers = {
  Book: {
    author: {
      fragment: '... on Book { id }',
      resolve: () => ({})
    },
  },
}

// THIS WORKS
const base = makeExecutableSchema({
  typeDefs: gql`
    type Own {
      one: Int,
      two: String
    }
  `,
  resolvers: {}
});
const mergedWorking = mergeSchemas({
  schemas: [base, typeDefs1, typeDefs2, typeDefsExtend],
  resolvers: [bookResolvers, authorResolvers, extendResolvers]
});

const server1 = new ApolloServer({
  schema: mergedWorking,
})
const app1 = express();
server1.applyMiddleware({ app: app1, path: '/api/graphql' })
app1.listen(8585)

// THIS DOESNT
const bookSchema = makeExecutableSchema({
  typeDefs: typeDefs1,
  resolvers: bookResolvers
});

const authorSchema = makeExecutableSchema({
  typeDefs: typeDefs2,
  resolvers: authorResolvers
});

const mergedBroken = mergeSchemas({
  schemas: [bookSchema, authorSchema, typeDefsExtend],
  resolvers: [extendResolvers]
  // Works when overwriting resolvers again
  // resolvers: [bookResolvers, authorResolvers, extendResolvers]
});

const server2 = new ApolloServer({
  schema: mergedBroken,
})
const app2 = express();
server2.applyMiddleware({ app: app2, path: '/api/graphql' })
app2.listen(8686)

