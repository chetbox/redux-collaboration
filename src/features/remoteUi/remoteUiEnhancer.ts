import type { Action, StoreEnhancer, StoreEnhancerStoreCreator, Reducer } from "redux"
import type { RemoteUiActionTag } from "../../server/remoteUiTypes"

export enum RemoteUiActionTypes {
  Dispatch = "remote_ui::dispatch",
}

export type RemoteUiAction<A extends Action<string>> = Action<RemoteUiActionTypes.Dispatch> & {
  actions: (A & Partial<RemoteUiActionTag>)[]
}

/**
 * Enhancer used to handle states and actions from the server and update the local state
 *
 * The server sends a state on first load and we use that as the initial "clean" state.
 * Locally dispatch actions are dispatched as normal making the local state "dirty".
 * Remote actions are applied on top of the latest "clean" state from the server.
 */
export default function createRemoteUiEnhancer<S, A extends Action<string>>({
  connectionId,
  onLocalDispatch,
}: {
  /**
   * A unique ID for this connection to the server
   */
  connectionId: string
  /**
   * Handle an action that has been dispatched locally. This is where the action is sent to the server for processing.
   */
  onLocalDispatch: (action: (A & RemoteUiActionTag)[]) => void
}) {
  return ((createStore: StoreEnhancerStoreCreator) => (reducer: Reducer<S, A>, initialState: S) => {
    let lastCleanState = initialState as S
    let lastActionId = -1
    const pendingActions: (A & RemoteUiActionTag)[] = []

    let localActionDispatchQueue: (A & RemoteUiActionTag)[] = []
    let localActionDispatchQueueTimeout: NodeJS.Timeout | null = null

    /**
     * Collect locally dispatched actions from this tick of JS execution
     * and dispatch them together
     */
    function addToBatchedLocalDispatch(action: A & RemoteUiActionTag) {
      localActionDispatchQueue.push(action)

      localActionDispatchQueueTimeout && clearTimeout(localActionDispatchQueueTimeout)
      localActionDispatchQueueTimeout = setTimeout(() => {
        onLocalDispatch([...localActionDispatchQueue])
        localActionDispatchQueue = []
      }, 0)
    }

    const enhancedReducer: Reducer<S, A | RemoteUiAction<A>, S> = (
      state: S | undefined,
      action: A | RemoteUiAction<A>,
    ): S => {
      switch (action.type) {
        case RemoteUiActionTypes.Dispatch: {
          // Remote actions are always dispatched on the latest known "clean" state
          const remoteActions = (action as Extract<RemoteUiAction<A>, { type: RemoteUiActionTypes.Dispatch }>).actions

          // Update the "clean" state - our source of truth
          for (const remoteAction of remoteActions) {
            lastCleanState = reducer(lastCleanState, remoteAction)

            const pendingActionIndex =
              remoteAction.__remoteUi?.connectionId === connectionId
                ? pendingActions.findIndex(
                    pendingAction => pendingAction.__remoteUi.actionId === remoteAction.__remoteUi?.actionId,
                  )
                : -1
            if (pendingActionIndex >= 0) {
              pendingActions.splice(pendingActionIndex, 1) // remove item
            }
          }

          // Re-construct the "dirty" state with eager updates by replaying pending actions
          state = lastCleanState
          for (const pendingAction of pendingActions) {
            state = reducer(state, pendingAction)
          }

          return state
        }

        default:
          // Ignore Redux internal init actions this is a clone of the store on the server
          if (action.type !== "@@INIT" && !(action.type as string).startsWith?.("@@redux/")) {
            // Tag the action before sending to server. We can then check the tag when it comes back
            lastActionId++
            const taggedAction: A & RemoteUiActionTag = {
              ...(action as A),
              __remoteUi: { connectionId, actionId: lastActionId },
            }
            addToBatchedLocalDispatch(taggedAction)

            // Locally dispatch the action, leaving the state "dirty" because we haven't got the source of truth from the server,
            // and saving the pending action so we can re-build a "dirty" state if any remote actions are dispatched in the meantime
            pendingActions.push(taggedAction)
            return reducer(state, taggedAction)
          } else {
            return state!
          }
      }
    }

    return createStore(enhancedReducer, initialState)
  }) as StoreEnhancer
}
