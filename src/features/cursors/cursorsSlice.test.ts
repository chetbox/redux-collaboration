import type { AppStore } from "../../app/store"
import { makeStore } from "../../app/store"
import type { CursorsSliceState } from "./cursorsSlice"
import { cursorsActions, cursorsSlice } from "./cursorsSlice"

interface LocalTestContext {
  store: AppStore
}

describe<LocalTestContext>("cursors reducer", it => {
  beforeEach<LocalTestContext>(context => {
    const initialState: CursorsSliceState = {}
    const store = makeStore(undefined, { cursors: initialState })
    context.store = store
  })

  it("should handle initial state", () => {
    expect(cursorsSlice.reducer(undefined, { type: "unknown" })).toStrictEqual({})
  })

  it("should handle connect, disconnect", ({ store }) => {
    store.dispatch(cursorsActions.connect({ connectionId: "id_1234" }))
    expect(store.getState()).toBe({ id_1234: {} })

    store.dispatch(cursorsActions.disconnect({ connectionId: "id_1234" }))
    expect(store.getState()).toBe({})
  })
})
