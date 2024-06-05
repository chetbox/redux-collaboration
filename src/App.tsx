import { useState } from "react"
import "./App.css"
import { Button, LeaderBoard, Settings } from "./features/button/Button"
import { Connections, Cursors } from "./features/cursors/Cursors"
import { NamePicker } from "./features/names/Names"
import { useAppSelector } from "./app/hooks"
import { namesSelectors } from "./features/names/namesSlice"
import { useUiConnectionId } from "./features/remoteUi/UiConnectionProvider"

const App = () => {
  const [showSettings, setShowSettings] = useState(false)
  const connectionId = useUiConnectionId()
  const name = useAppSelector(state => namesSelectors.name(state, connectionId))

  if (!name) {
    return (
      <div className="App">
        <NamePicker />
      </div>
    )
  }

  return (
    <div className="App">
      <button onClick={() => setShowSettings(true)}>Settings</button>
      <Cursors />
      <Button />
      <LeaderBoard />
      <div className="Settings" style={!showSettings ? { transform: "translateX(100%)" } : undefined}>
        <button onClick={() => setShowSettings(false)}>Close</button>
        <Settings />
      </div>
      <div className="Connections">
        <Connections />
      </div>
    </div>
  )
}

export default App
