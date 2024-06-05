import type { Action, Middleware, StoreEnhancer, ThunkAction } from "@reduxjs/toolkit"
import { combineSlices, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { cursorsSlice } from "../features/cursors/cursorsSlice"
import { buttonSlice } from "../features/button/buttonSlice"

// `combineSlices` automatically combines the reducers
const rootReducer = combineSlices(cursorsSlice, buttonSlice)

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (
  { middlewares = [], enhancers = [] }: { middlewares?: Middleware[]; enhancers?: StoreEnhancer[] } = {},
  preloadedState?: Partial<RootState>,
) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat(...middlewares)
    },
    enhancers: getDefaultEnhancer => {
      return getDefaultEnhancer().concat(...enhancers)
    },
    preloadedState,
  })
  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch)
  return store
}

// Infer the type of `store`
export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof makeStore>
export type AppDispatch = AppStore["dispatch"]
export type AppAction = Parameters<AppDispatch>[0]
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>
