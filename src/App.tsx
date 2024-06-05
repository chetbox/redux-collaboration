import "./App.css"
import { Button, LeaderBoard } from "./features/button/Button"
import { Cursors } from "./features/cursors/Cursors"

const App = () => {
  return (
    <div className="App">
      <Cursors />
      <Button />
      <LeaderBoard />
    </div>
  )
}

export default App
