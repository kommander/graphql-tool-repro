const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');
const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const app = express();

const typeDefs1 = gql`
  type Query {
    book: Book
  }

  type Book {
    id: Int!
    title: String
  }
`;

const typeDefs2 = gql`
  type Query {
    author: Author
  }

  type Author {
    id: Int!
    name: String
    bookIds: [Int!]
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
    book: (id = 1) => {
      const books = [{ id: 1, title: 'One Book' }];

      return books.find(book => book.id === id);
    }
  }
};

const authorResolvers = {
  Query: {
    author: (id = 1) => {
      const authors = [{ id: 1, name: 'One Author', books: [1] }];

      return authors.find(author => author.id === id);
    }
  },
  Author: {
    bookIds: author => {
      return author.books;
    }
  }
};

const extendResolvers = {
  Book: {
    author: {
      fragment: '... on Book { id }',
      resolve: (book, args, context, info) => {
        const { id } = book;

        console.log('resolving book.author for', book);

        return info.mergeInfo.delegateToSchema({
          schema: authorSchema,
          operation: 'query',
          fieldName: 'author',
          args: { id },
          context,
          info
        });
      }
    }
  },
  Author: {
    books: {
      fragment: '... on Author { bookIds }',
      resolve: (author, args, context, info) => {
        const { bookIds } = author;

        console.log('resolving author.books for', author);

        return Promise.all(
          bookIds.map(id => {
            return info.mergeInfo.delegateToSchema({
              schema: bookSchema,
              operation: 'query',
              fieldName: 'book',
              args: { id },
              context,
              info
            });
          })
        );
      }
    }
  }
};

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
  schema: merged
});

server.applyMiddleware({ app, path: '/api/graphql' });

app.listen(8484);
