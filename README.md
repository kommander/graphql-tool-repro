# graphql-tools merge behaviour repro

- checkout repository
- run `yarn` or `npm i`
- run `node index.js`

## Problem
When using `mergeSchemas` with schemas created by `makeExecutableSchema`, resolvers are not called correctly.

## This works
- browse to `localhost:8585/api/graphql` to open playground
- execute the following query
```gql
{
  book {
    author {
      name
    }
  }
}
```

## This does not
- browse to `localhost:8686/api/graphql` to open playground
- execute the same query
```gql
{
  book {
    author {
      name
    }
  }
}
```

## Expected Result
```json
{
  "data": {
    "book": {
      "author": {
        "name": "Always the same"
      }
    }
  }
}
```