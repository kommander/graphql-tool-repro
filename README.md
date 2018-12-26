# graphql-tools merge behaviour repro

- checkout repository
- run `yarn` or `npm i`
- run `node index.js`
- browse to `localhost:8484/api/graphql` to open playground

## This works
```gql
{
  book {
    id
    title
    author {
      id
      name
      books {
        id
        title
        author {
          id
          name
          books {
            id
            title
            author {
              name
            }
          }
        }
      }
    }
  }
}
```

## This does not
```gql
{
  author {
    id
    name
    books {
      id
      title
      author {
        id
        name
        books {
          title
          author {
            name
          }
        }
      }
    }
  }
}
```

## Possible Cause
https://github.com/apollographql/graphql-tools/blob/master/src/stitching/mergeSchemas.ts#L446

Because of the delegated resolver, the query for `author` does not return `author.books`, which are needed to resolve the book objects.

## Possible Solution
- **Ugly:** Add `bookIds` to the `Author` type, but then we need to explicitly select `bookIds` in the query. We could inject transforms to the delegating resolver somehow to always fetch `bookIds`, but that just makes a simple task like this even more hideous.