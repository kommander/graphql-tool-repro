# graphql-tools merge behaviour repro

- checkout repository
- run `yarn` or `npm i`
- run `node index.js`
- browse to `localhost:8484/api/graphql` to open playground

## This does not work
```gql
subscription {
  prefix_counterIncrement {
    value
  }
}
```

## Possible Cause
- https://github.com/apollographql/graphql-tools/blob/master/src/transforms/transformSchema.ts#L15-L28

## Possible Solution
- **Ugly:** Do not use the RenameRootField transform for subscriptions :scream: