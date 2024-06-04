import "./App.css"
import { Counter } from "./features/counter/Counter"
import { Cursors } from "./features/cursors/Cursors"

const App = () => {
  return (
    <div className="App">
      <Cursors />
      <Counter />
    </div>
  )
}

export default App
