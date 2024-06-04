import type { Middleware, Dispatch, Action } from "redux"
import RemoteUiServer from "./RemoteUiServer"
import type { RemoteUiEvents_ClientToServer, RemoteUiEvents_ServerToClient } from "./RemoteUiServer"
import type { Server as SocketIoServer } from "socket.io"
import type { RemoteUiActionTag } from "./remoteUiTypes"

export function createRemoteUiServerMiddleware<StateT, ActionT extends Action & Partial<RemoteUiActionTag>>(
  socketIoServer: SocketIoServer<
    RemoteUiEvents_ClientToServer<ActionT>,
    RemoteUiEvents_ServerToClient<StateT, ActionT>
  >,
  hooks: {
    onConnected?: (uiConnectionId: string) => void
    onDisconnected?: (uiConnectionId: string) => void
  } = {},
): Middleware<{}, StateT, Dispatch<ActionT>> {
  return (store => {
    const server = new RemoteUiServer<StateT, ActionT>(socketIoServer, store, hooks)

    return (next: Dispatch<ActionT>) => (action: ActionT) => {
      const previousState = store.getState()
      const result = next(action)
      const state = store.getState()

      // We don't need to forward the action to a remote UI if:
      // - The action doesn't change the state of our store in any way. This is an optimization.
      // - It originated from any remote UI - we will run it through the store and it will get sent at that point
      if (state !== previousState || action.__remoteUi) {
        server.sendAction(action)
      }

      return result
    }
  }) as Middleware<{}, StateT, Dispatch<ActionT>>
}
