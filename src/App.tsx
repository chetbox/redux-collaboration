import { useState } from "react"
import "./App.css"
import { Button, LeaderBoard, Settings } from "./features/button/Button"
import { Cursors } from "./features/cursors/Cursors"

const App = () => {
  const [showSettings, setShowSettings] = useState(false)

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
    </div>
  )
}

export default App
