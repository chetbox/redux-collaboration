import express from "express"
import http from "http"
import { Server } from "socket.io"
import livereload from "livereload"
import connectLivereload from "connect-livereload"
import path from "path"
import { fileURLToPath } from "url"
import { makeStore } from "../app/store"
import { createRemoteUiServerMiddleware } from "./remoteUiServerMiddleware"
import { cursorsActions } from "../features/cursors/cursorsSlice"

// Get __dirname (require because this project uses ESM)
const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// Server's Redux store is the source of truth
const store = makeStore({
  middlewares: [
    createRemoteUiServerMiddleware(io, {
      // Track connections in the store
      onConnected: connectionId => {
        console.log(`Connected: ${connectionId}`)
        store.dispatch(cursorsActions.connect({ connectionId }))
      },
      onDisconnected: connectionId => {
        console.log(`Disconnected: ${connectionId}`)
        store.dispatch(cursorsActions.disconnect({ connectionId }))
      },
    }),
  ],
})

// Live reloading for development
const liveReloadServer = livereload.createServer()
liveReloadServer.watch(path.join(__dirname, "..", "..", "dist"))
app.use(connectLivereload())

// Host pre-built static files
app.use(express.static("dist"))

server.listen(8080, () => {
  console.log("listening on *:8080")
})
