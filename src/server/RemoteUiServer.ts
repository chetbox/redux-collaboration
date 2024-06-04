import type { Socket, Server as SocketIoServer } from "socket.io"

export interface RemoteUiEvents_ServerToClient<State, Action> {
  init(args: { uiConnectionId: string; state: State }): void
  actions(action: Action[]): void
  timeSync(response: { id: string | null; result: number }): void
}

export interface RemoteUiEvents_ClientToServer<Action> {
  dispatch(actions: Action[]): void
  timeSync(request: { id: string | null; result: number }, ack: () => void): void
}

export default class RemoteUiServer<State, Action> {
  private sockets = new Set<
    Socket<RemoteUiEvents_ClientToServer<Action>, RemoteUiEvents_ServerToClient<State, Action>>
  >()
  constructor(
    private socketIoServer: SocketIoServer<
      RemoteUiEvents_ClientToServer<Action>,
      RemoteUiEvents_ServerToClient<State, Action>
    >,
    {
      getState,
      dispatch,
    }: {
      getState: () => State
      dispatch: (action: Action) => void
    },
    {
      onConnected,
      onDisconnected,
    }: {
      onConnected?: (uiConnectionId: string) => void
      onDisconnected?: (uiConnectionId: string) => void
    },
  ) {
    // Track connections
    this.socketIoServer.on("connection", socket => {
      const uiConnectionId = socket.id

      this.sockets.add(socket)

      socket.conn.on("close", () => {
        this.sockets.delete(socket)
        onDisconnected?.(uiConnectionId)
      })

      // Support time synchronization
      socket.on("timeSync", (data, ack) => {
        socket.emit("timeSync", {
          id: data && "id" in data ? data.id : null,
          result: Date.now(),
        })
        ack()
      })

      // Dispatch Redux actions from the UI
      socket.on("dispatch", actions => {
        for (const action of actions) {
          dispatch(action)
        }
      })

      // Send the Redux state for the UI to initialize its copy of the store
      socket.emit("init", {
        uiConnectionId,
        state: getState(),
      })

      onConnected?.(uiConnectionId)
    })
  }

  private actionsToSendTimeout: NodeJS.Immediate | null = null
  private actionsToSend: Action[] = []

  /**
   * Add an action to be sent to all remote UIs
   *
   * Uses `setImmediate` to wait until the end of the pass of Redux middlewares
   * in case other actions are to be dispatched in the same batch
   */
  public sendAction(action: Action) {
    this.actionsToSend.push(action)

    if (this.actionsToSendTimeout) {
      clearImmediate(this.actionsToSendTimeout)
      this.actionsToSendTimeout = null
    }

    this.actionsToSendTimeout = setImmediate(() => {
      this.socketIoServer.emit("actions", this.actionsToSend)
      this.actionsToSendTimeout = null
      this.actionsToSend = []
    })
  }

  public close() {
    for (const socket of this.sockets) {
      socket.conn.close()
    }
  }
}
