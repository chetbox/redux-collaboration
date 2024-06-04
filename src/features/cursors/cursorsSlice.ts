import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Coord {
  x: number
  y: number
}

export interface CursorState {
  position: Coord | null
  click?: true
}

export interface CursorsSliceState {
  [connectionId: string]: CursorState
}

export type ConnectionAction<T> = T & {
  connectionId: string
}

const initialState: CursorsSliceState = {}

export const cursorsSlice = createSlice({
  name: "cursors",
  initialState,
  reducers: create => ({
    connect: create.reducer((state, { payload }: PayloadAction<ConnectionAction<Record<never, never>>>) => {
      state[payload.connectionId] = { position: null }
    }),
    disconnect: create.reducer((state, { payload }: PayloadAction<ConnectionAction<Record<never, never>>>) => {
      delete state[payload.connectionId]
    }),
    setPosition: create.reducer((state, { payload }: PayloadAction<ConnectionAction<{ position: Coord | null }>>) => {
      if (!(payload.connectionId in state)) {
        return
      }
      state[payload.connectionId].position = payload.position
    }),
    setClick: create.reducer((state, { payload }: PayloadAction<ConnectionAction<{ click: boolean }>>) => {
      if (!(payload.connectionId in state)) {
        return
      }
      state[payload.connectionId].click = payload.click ? true : undefined
    }),
  }),
  selectors: {
    count: cursors => Object.keys(cursors).length,
    ids: cursors => Object.keys(cursors),
  },
})

export const cursorsActions = cursorsSlice.actions

export const cursorsSelectors = cursorsSlice.selectors
