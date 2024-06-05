import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { useUiConnectionId } from "../remoteUi/UiConnectionProvider"
import styles from "./Button.module.css"
import { buttonActions, buttonSelectors } from "./buttonSlice"

export const Button = () => {
  const dispatch = useAppDispatch()
  const fontSize = useAppSelector(buttonSelectors.fontSize)
  const text = useAppSelector(buttonSelectors.text)
  const color = useAppSelector(buttonSelectors.textColor)
  const backgroundColor = useAppSelector(buttonSelectors.backgroundColor)
  const counter = useAppSelector(buttonSelectors.counter)
  const uiConnectionId = useUiConnectionId()
  const isClickedByMe = useAppSelector(state => buttonSelectors.clickedBy(state, uiConnectionId))

  return (
    <div>
      <div className={styles.counter} style={counter < 5 ? { color: "red" } : undefined}>
        {counter}
      </div>
      <button
        className={styles.button}
        style={{ fontSize, backgroundColor, color }}
        onClick={e => dispatch(buttonActions.click(uiConnectionId))}
        disabled={isClickedByMe}
      >
        {text}
      </button>
      <p className={styles.hint}>Lowest score wins</p>
      <form className={styles.settings}>
        <label>
          Text
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
          Background
          <input
            className={styles.input}
            type="color"
            value={backgroundColor}
            onChange={e => dispatch(buttonActions.setBackgroundColor(e.target.value))}
          />
        </label>
      </form>
    </div>
  )
}

export const LeaderBoard = () => {
  const leaderBoard = useAppSelector(buttonSelectors.leaderBoard)

  return (
    <ol className={styles.leaderBoard}>
      {leaderBoard.map(({ name, score }, index) => (
        <li key={name} style={index === 0 ? { fontWeight: "bold" } : undefined}>
          {score.toString().padStart(2, "0")} - {name}
        </li>
      ))}
    </ol>
  )
}
