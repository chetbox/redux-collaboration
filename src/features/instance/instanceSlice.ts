import { createAppSlice } from "../../app/createAppSlice"
import { v4 as uuidV4 } from "uuid"

export interface NamesSliceState {
  id: string
}
export const instanceSlice = createAppSlice({
  name: "instance",
  initialState: { id: uuidV4() },
  reducers: {
    reset: state => {
      state.id = uuidV4()
    },
  },
  selectors: {
    id: state => state.id,
  },
})

export const namesSelectors = instanceSlice.selectors
