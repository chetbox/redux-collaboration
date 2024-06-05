# redux-collab

An implementation of [The Button](<https://en.wikipedia.org/wiki/The_Button_(Reddit)>)
as an example of synchronizing a Redux store from a server's source-of-truth to multiple clients using Socket.IO.

## Running locally

```
yarn
yarn start
```

## Deploying to a server

```
yarn
yarn build
NODE_ENV=production yarn start:server
```
