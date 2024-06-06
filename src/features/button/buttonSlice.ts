import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"
import { instanceSlice } from "../instance/instanceSlice"

export interface ButtonSliceState {
  clickedBy: { name: string; score: number }[]
  text: string
  backgroundColor: string
  textColor: string
  fontSize: number
  counter: number
  counterReset: number
}

const initialState: ButtonSliceState = {
  clickedBy: [],
  text: "Save my score",
  backgroundColor: "#704cb6",
  textColor: "#ffffff",
  fontSize: 20,
  counter: 64,
  counterReset: 64,
}

export const buttonSlice = createAppSlice({
  name: "button",
  initialState,
  reducers: create => ({
    click: create.reducer((state, { payload }: PayloadAction<string>) => {
      if (!state.clickedBy.find(({ name }) => name === payload)) {
        state.clickedBy.push({ name: payload, score: state.counter })
        state.counter = state.counterReset
      }
    }),
    setText: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.text = payload
    }),
    incrementFontSize: create.reducer((state, { payload }: PayloadAction<number>) => {
      state.fontSize += payload
    }),
    decrementFontSize: create.reducer((state, { payload }: PayloadAction<number>) => {
      state.fontSize -= payload
    }),
    setBackgroundColor: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.backgroundColor = payload
    }),
    setTextColor: create.reducer((state, { payload }: PayloadAction<string>) => {
      state.textColor = payload
    }),
    countdown: create.reducer(state => {
      state.counter -= 1
      if (state.counter <= 0) {
        state.counterReset *= 2
        state.counter = state.counterReset
      }
    }),
  }),
  extraReducers(builder) {
    builder.addCase(instanceSlice.actions.reset, () => initialState)
  },
  selectors: {
    text: state => state.text,
    textColor: state => state.textColor,
    fontSize: state => state.fontSize,
    backgroundColor: state => state.backgroundColor,
    counter: state => state.counter,
    clickedBy: (state, name: string) => !!state.clickedBy.find(item => item.name === name),
    clickedCount: state => state.clickedBy.length,
    leaderBoard: state => [...state.clickedBy].sort((a, b) => a.score - b.score),
    nextCounterReset: state => state.counterReset * 2,
  },
})

export const buttonActions = buttonSlice.actions

export const buttonSelectors = buttonSlice.selectors
