import { useAppDispatch, useAppSelector } from "../../app/hooks"
import styles from "./Counter.module.css"
import { decrement, increment, selectCount } from "./counterSlice"

export const Counter = () => {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)

  return (
    <div>
      <div className={styles.row}>
        <button className={styles.button} aria-label="Decrement value" onClick={() => dispatch(decrement())}>
          -
        </button>
        <span aria-label="Count" className={styles.value}>
          {count}
        </span>
        <button className={styles.button} aria-label="Increment value" onClick={() => dispatch(increment())}>
          +
        </button>
      </div>
    </div>
  )
}
