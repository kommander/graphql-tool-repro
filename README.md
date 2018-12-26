# graphql-tools merge behaviour repro

- checkout repository
- run `yarn` or `npm i`
- run `node index.js`
- browse to `localhost:8484/api/graphql` to open playground

## This does not work
```gql
{
  favoriteColor
  avatar(borderColor:RED)
}
```

## Possible Cause
- https://github.com/apollographql/graphql-tools/blob/master/src/stitching/mergeSchemas.ts#L446
- https://github.com/apollographql/graphql-tools/blob/master/src/stitching/schemaRecreation.ts#L207

## Possible Solution
- **Ugly:** Do not use ENUM resolvers when merging with `mergeSchemas` :scream: