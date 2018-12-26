const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const app = express();

const books = [{ id: 1, title: 'One Book' }];
const authors = [{ id: 1, name: 'One Author', books: [1] }]

const typeDefs1 = gql`
  type Query {
    book: Book
  }

  type Book {
    id: Int!,
    title: String
  }
`;

const typeDefs2 = gql`
  type Query {
    author: Author
  }

  type Author {
    id: Int!,
    name: String
  }
`;

const typeDefsExtend = gql`
  extend type Author {
    books: [Book]
  }

  extend type Book {
    author: Author
  }
`;

const bookResolvers = {
  Query: {
    book: () => books.find(book => (book.id === 1))
  }
}

const authorResolvers = {
  Query: {
    author: () => authors.find(author => (author.id === 1))
  }
}

const extendResolvers = {
  Book: {
    author: (book) => {
      console.log('resolving book.author for', book)
      return authors.find(author => author.books.includes(book.id))
    } 
  },
  Author: {
    books: (author) => {
      console.log('resolving author.books for', author)
      return books.filter(book => author.books.includes(book.id))
    } 
  }
}

const bookSchema = makeExecutableSchema({
  typeDefs: typeDefs1,
  resolvers: bookResolvers
});

const authorSchema = makeExecutableSchema({
  typeDefs: typeDefs2,
  resolvers: authorResolvers
});

const merged = mergeSchemas({
  schemas: [bookSchema, authorSchema, typeDefsExtend],
  resolvers: [extendResolvers]
});

const server = new ApolloServer({
  schema: merged,
})

server.applyMiddleware({ app, path: '/api/graphql' })

app.listen(8484)

