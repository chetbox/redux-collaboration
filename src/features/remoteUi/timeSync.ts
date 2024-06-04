import { create as createTimeSync } from "timesync"
import { setDate } from "./setDate"
import type { UiConnectionSocket } from "./UiConnectionProvider"

export function syncTime(socket: UiConnectionSocket) {
  // Remote UIs perform a periodic time sync with COGS
  const timeSync = createTimeSync({
    server: socket,
    interval: 60_000, // Immediately then every 1 min (The default is 1hr)
  })
  timeSync.on("change", () => {
    // Patch `Date.now()` and `new Date()`
    setDate(timeSync.now())
  })
  // Override `send` to use socket.io
  timeSync.send = async (socket, data, timeout) => {
    await socket?.timeout(timeout).emitWithAck("timeSync", data)
  }
  socket.on("timeSync", serverTime => {
    timeSync.receive(null, serverTime)
  })
}
