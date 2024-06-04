import type { PropsWithChildren } from "react"
import React, { useContext } from "react"
import type { Socket as SocketIoClient } from "socket.io-client"
import type { AppAction, RootState } from "../../app/store"
import type { RemoteUiEvents_ClientToServer, RemoteUiEvents_ServerToClient } from "../../server/RemoteUiServer"

export type UiConnectionId = string

export type UiConnectionSocket = SocketIoClient<
  RemoteUiEvents_ServerToClient<RootState, AppAction>,
  RemoteUiEvents_ClientToServer<AppAction>
>

export interface UiConnectionContextT {
  connectionId: UiConnectionId
  socket: UiConnectionSocket | undefined
}

const UiConnectionContext = React.createContext<UiConnectionContextT>({
  connectionId: "",
  socket: undefined,
})

export function UiConnectionProvider({ connectionId, socket, children }: PropsWithChildren<UiConnectionContextT>) {
  return <UiConnectionContext.Provider value={{ connectionId, socket }}>{children}</UiConnectionContext.Provider>
}

export function useUiConnectionId() {
  return useContext(UiConnectionContext).connectionId
}

export function useUiConnectionSocket() {
  return useContext(UiConnectionContext).socket
}
