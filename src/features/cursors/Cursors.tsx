import throttle from "lodash.throttle"
import { useLayoutEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { namesSlice } from "../names/namesSlice"
import { useUiConnectionId } from "../remoteUi/UiConnectionProvider"
import styles from "./Cursors.module.css"
import { cursorsSlice } from "./cursorsSlice"

export const Cursors = () => {
  const dispatch = useAppDispatch()
  const cursors = useAppSelector(state => state[cursorsSlice.name])
  const connectionId = useUiConnectionId()
  const connectionIdNames = useAppSelector(state => state[namesSlice.name].connectionIdNames)

  useLayoutEffect(() => {
    dispatch(cursorsSlice.actions.connect({ connectionId }))
    return () => {
      dispatch(cursorsSlice.actions.disconnect({ connectionId }))
    }
  }, [connectionId, dispatch])

  // Update cursor position from mouse
  useLayoutEffect(() => {
    const onMove = throttle((event: MouseEvent) => {
      dispatch(
        cursorsSlice.actions.setPosition({
          connectionId: connectionId,
          position: { x: event.clientX, y: event.clientY },
        }),
      )
    }, 50)

    document.body.addEventListener("mouseenter", onMove)
    document.body.addEventListener("mousemove", onMove)
    return () => {
      document.body.removeEventListener("mouseenter", onMove)
      document.body.removeEventListener("mousemove", onMove)
    }
  }, [connectionId, dispatch])

  // Hide cursor when leaving the window
  useLayoutEffect(() => {
    const onMouseLeave = () =>
      dispatch(
        cursorsSlice.actions.setPosition({
          connectionId: connectionId,
          position: null,
        }),
      )

    document.body.addEventListener("mouseleave", onMouseLeave)
    return () => {
      document.body.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [connectionId, dispatch])

  // Update cursor position from touch devices
  useLayoutEffect(() => {
    const throttleMs = 50
    const onMove = throttle((event: TouchEvent) => {
      const touch = event.touches[0] // Only support single touch
      dispatch(
        cursorsSlice.actions.setPosition({
          connectionId: connectionId,
          position: { x: touch.clientX, y: touch.clientY },
        }),
      )
    }, throttleMs)
    const onEnd = () => {
      setTimeout(
        () =>
          dispatch(
            cursorsSlice.actions.setPosition({
              connectionId: connectionId,
              position: null,
            }),
          ),
        throttleMs,
      )
    }

    document.body.addEventListener("touchstart", onMove)
    document.body.addEventListener("touchmove", onMove)
    document.body.addEventListener("touchend", onEnd)
    document.body.addEventListener("touchcancel", onEnd)
    return () => {
      document.body.removeEventListener("touchstart", onMove)
      document.body.removeEventListener("touchmove", onMove)
      document.body.removeEventListener("touchend", onEnd)
      document.body.removeEventListener("touchcancel", onEnd)
    }
  }, [connectionId, dispatch])

  // Hide cursor when tab unfocused
  useLayoutEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        dispatch(
          cursorsSlice.actions.setPosition({
            connectionId: connectionId,
            position: null,
          }),
        )
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [connectionId, dispatch])

  return (
    <>
      {Object.entries(cursors).map(
        ([id, cursor]) =>
          cursor.position && (
            <div
              key={id}
              className={styles.cursor}
              style={{ left: cursor.position.x, top: cursor.position.y, opacity: id === connectionId ? 0.5 : 1 }}
            >
              {connectionIdNames[id] || id}
            </div>
          ),
      )}
    </>
  )
}

export const Connections = () => {
  const count = useAppSelector(cursorsSlice.selectors.count)

  return (
    <ul className={styles.connections}>
      {new Array(count).fill(null).map((_, index) => (
        <li key={index}>•</li>
      ))}
    </ul>
  )
}
