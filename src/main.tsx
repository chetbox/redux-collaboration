import React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import App from "./App"
import type { AppAction, RootState } from "./app/store"
import { makeStore } from "./app/store"
import { io } from "socket.io-client"
import "./index.css"
import { syncTime } from "./features/remoteUi/timeSync"
import createRemoteUiEnhancer, { RemoteUiActionTypes } from "./features/remoteUi/remoteUiEnhancer"
import { UiConnectionProvider, type UiConnectionSocket } from "./features/remoteUi/UiConnectionProvider"

const container = document.getElementById("root")!
const root = createRoot(container)

const websocketUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`

const socket: UiConnectionSocket = io(websocketUrl)

syncTime(socket)

let store: ReturnType<typeof makeStore> | null = null

// Handle the initial state. We should only get this once, as the first message, per connection
socket.on("init", ({ uiConnectionId, state }) => {
  // const previousInstanceId = store?.getState().instanceId

  // // Check for a new instance. It could be a different version, release type, etc
  // // so reload the whole page to ensure the JavaScript in the browser is in sync.
  // if (previousInstanceId && state.instanceId !== previousInstanceId) {
  //   console.info(`Instance changed from ${previousInstanceId} to ${state.instanceId}. Reloading...`)
  //   window.location.reload()
  //   return
  // }

  store = makeStore(
    {
      enhancers: [
        createRemoteUiEnhancer<RootState, AppAction>({
          connectionId: uiConnectionId,
          // When an action is dispatched locally send it to the server
          // to share it with all remote connections
          onLocalDispatch(action) {
            socket.timeout(5000).emit("dispatch", action)
          },
        }),
      ],
    },
    state,
  )

  // Remote actions are passed (in batches) to the remote UI enhancer to update the local state
  socket.on("actions", actions => {
    if (!store) {
      throw new Error("Store not ready")
    }
    store.dispatch({ type: RemoteUiActionTypes.Dispatch, actions })
  })

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <UiConnectionProvider connectionId={uiConnectionId} socket={socket}>
          <App />
        </UiConnectionProvider>
      </Provider>
    </React.StrictMode>,
  )
})
