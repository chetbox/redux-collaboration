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

  // Update cursor position
  useLayoutEffect(() => {
    const onMouseMove = throttle((event: MouseEvent) => {
      dispatch(
        cursorsSlice.actions.setPosition({
          connectionId: connectionId,
          position: { x: event.clientX, y: event.clientY },
        }),
      )
    }, 50)

    document.body.addEventListener("mouseenter", onMouseMove)
    document.body.addEventListener("mousemove", onMouseMove)
    return () => {
      document.body.removeEventListener("mouseenter", onMouseMove)
      document.body.removeEventListener("mousemove", onMouseMove)
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
              style={{ left: cursor.position.x, top: cursor.position.y, opacity: id === connectionId ? 0 : 1 }}
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
