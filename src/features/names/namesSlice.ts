import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"

export interface NamesSliceState {
  connectionIdNames: Record<string, string>
  nameConnectionIds: Record<string, string>
}

const initialState: NamesSliceState = {
  connectionIdNames: {},
  nameConnectionIds: {},
}

export const namesSlice = createAppSlice({
  name: "names",
  initialState,
  reducers: create => ({
    register: create.reducer((state, { payload }: PayloadAction<{ connectionId: string; name: string }>) => {
      state.nameConnectionIds[payload.name] = payload.connectionId
      state.connectionIdNames[payload.connectionId] = payload.name
    }),
  }),
  selectors: {
    nameExists: (state, name: string) => !!state.nameConnectionIds[name],
    name: (state, connectionId: string): string | undefined => state.connectionIdNames[connectionId],
  },
})

export const namesActions = namesSlice.actions

export const namesSelectors = namesSlice.selectors
