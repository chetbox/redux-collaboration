import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { namesSelectors } from "../names/namesSlice"
import { useUiConnectionId } from "../remoteUi/UiConnectionProvider"
import styles from "./Button.module.css"
import { buttonActions, buttonSelectors } from "./buttonSlice"
import usePrevious from "use-previous"
import JSConfetti from "js-confetti"
import { useEffect } from "react"

const jsConfetti = new JSConfetti()

export const Button = () => {
  const dispatch = useAppDispatch()
  const fontSize = useAppSelector(buttonSelectors.fontSize)
  const text = useAppSelector(buttonSelectors.text)
  const color = useAppSelector(buttonSelectors.textColor)
  const backgroundColor = useAppSelector(buttonSelectors.backgroundColor)
  const counter = useAppSelector(buttonSelectors.counter)
  const connectionId = useUiConnectionId()
  const name = useAppSelector(state => namesSelectors.name(state, connectionId))
  const isClickedByMe = useAppSelector(state => (name ? buttonSelectors.clickedBy(state, name) : false))
  const nextCounterReset = useAppSelector(buttonSelectors.nextCounterReset)
  const lastCounterReset = usePrevious(nextCounterReset)

  const clickedCount = useAppSelector(buttonSelectors.clickedCount)
  const previousClickedCount = usePrevious(clickedCount) ?? clickedCount

  useEffect(() => {
    clickedCount > previousClickedCount &&
      jsConfetti.addConfetti({ emojis: ["🏆"], confettiNumber: clickedCount - previousClickedCount, emojiSize: 200 })
  }, [clickedCount, previousClickedCount])

  useEffect(() => {
    counter === lastCounterReset && jsConfetti.addConfetti({ emojis: ["💥"], confettiNumber: 10, emojiSize: 200 })
  }, [counter, lastCounterReset])

  return (
    <div>
      <div className={styles.counter} style={counter < 5 ? { color: "red" } : undefined}>
        {counter}
      </div>
      <button
        className={styles.button}
        style={{ fontSize, backgroundColor, color }}
        onClick={() => name && dispatch(buttonActions.click(name))}
        disabled={!name || isClickedByMe}
      >
        {text}
      </button>
      <p className={styles.hint}>
        You have one chance
        <br />
        <br />
        Lowest score wins
        <br />
        <br />
        If nobody presses,
        <br />
        counter resets to <b>{nextCounterReset}</b>
      </p>
    </div>
  )
}

export const Settings = ({ className }: { className?: string }) => {
  const dispatch = useAppDispatch()
  const text = useAppSelector(buttonSelectors.text)
  const color = useAppSelector(buttonSelectors.textColor)
  const backgroundColor = useAppSelector(buttonSelectors.backgroundColor)

  return (
    <form className={`${className} ${styles.settings}`}>
      <label>
        Button Text
        <input
          className={styles.input}
          type="color"
          value={color}
          onChange={e => dispatch(buttonActions.setTextColor(e.target.value))}
        />
        <input
          className={styles.input}
          type="text"
          value={text}
          onChange={e => dispatch(buttonActions.setText(e.target.value))}
        />
        {/* <label>
            <button onClick={() => dispatch(buttonActions.decrementFontSize(1))}>-</button> {fontSize} pt{" "}
            <button onClick={() => dispatch(buttonActions.incrementFontSize(1))}>+</button>
          </label> */}
      </label>
      <label>
        Button Background
        <input
          className={styles.input}
          type="color"
          value={backgroundColor}
          onChange={e => dispatch(buttonActions.setBackgroundColor(e.target.value))}
        />
      </label>
    </form>
  )
}

export const LeaderBoard = () => {
  const leaderBoard = useAppSelector(buttonSelectors.leaderBoard)

  return (
    <ol className={styles.leaderBoard}>
      {leaderBoard.map(({ name, score }, index) => (
        <li key={name} style={index === 0 ? { fontWeight: "bold" } : undefined}>
          {score} - {name}
        </li>
      ))}
    </ol>
  )
}
