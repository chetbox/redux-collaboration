import { createAppSlice } from "../../app/createAppSlice"
import { v4 as uuidV4 } from "uuid"

export interface InstanceSliceState {
  id: string
}

function createInstance(): InstanceSliceState {
  return { id: uuidV4() }
}

export const instanceSlice = createAppSlice({
  name: "instance",
  initialState: createInstance(),
  reducers: {
    reset: () => createInstance(),
  },
  selectors: {
    id: state => state.id,
  },
})

export const namesSelectors = instanceSlice.selectors
