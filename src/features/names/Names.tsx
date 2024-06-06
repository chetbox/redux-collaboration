import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { useUiConnectionId } from "../remoteUi/UiConnectionProvider"
import styles from "./Names.module.css"
import { namesActions, namesSelectors } from "./namesSlice"

export const NamePicker = () => {
  const dispatch = useAppDispatch()
  const [name, setName] = useState("")
  const connectionId = useUiConnectionId()
  const nameAlreadyExists = useAppSelector(state => namesSelectors.nameExists(state, name))

  return (
    <form
      className={styles.picker}
      onSubmit={() => {
        if (!name || nameAlreadyExists) return
        dispatch(namesActions.register({ connectionId, name }))
        localStorage.setItem("name", name) // Save to retrieve later, allowing us to give the same name to a new connection
      }}
    >
      <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
      <input type="submit" value="Submit" disabled={!name || nameAlreadyExists} />
      {<p className={styles.error}>{nameAlreadyExists ? "Name already taken" : " "}</p>}
      <p>
        You have one chance
        <br />
        to press the button
        <br />
        <br />
        Lowest score wins
        <br />
        <br />
        If nobody presses,
        <br />
        the counter resets
      </p>
    </form>
  )
}
