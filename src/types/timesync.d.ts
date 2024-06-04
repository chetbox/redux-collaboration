// Adapted from https://github.com/enmasseio/timesync/issues/25#issuecomment-1367979606

declare module "timesync" {
  type TimeSync<ServerT> = {
    destroy()
    now(): number
    on(event: "change", callback: (offset: number) => void)
    on(event: "error", callback: (err: any) => void)
    on(event: "sync", callback: (value: "start" | "end") => void)
    off(event: "change" | "error" | "sync", callback?: () => void)
    sync()

    send(to: ServerT | null, data: { id: string | null; result: number }, timeout: number): Promise<void>
    receive(from: string | null, data: { id: string | null; result: number })
  }

  type TimeSyncCreateOptions<ServerT> = {
    interval?: number
    timeout?: number
    delay?: number
    repeat?: number
    peers?: string | string[]
    server?: ServerT
    now?: () => number
  }

  export function create<ServerT>(options: TimeSyncCreateOptions<ServerT>): TimeSync<ServerT>
}

declare module "timesync/server" {
  import type { Request as ExpressRequest, Response as ExpressResponse } from "express"
  import type { Server, createServer as createHttpServer } from "http"
  function requestHandler(req: Request | ExpressRequest, res: Response | ExpressResponse): void

  function createServer(): ReturnType<typeof createHttpServer>

  function attachServer(server: Server, path?: string): void
}
