import "./App.css"
import { Counter } from "./features/counter/Counter"
import { Quotes } from "./features/quotes/Quotes"
import { Reddit } from "./features/reddit/Reddit"
import logo from "./greennit-logo.png"

export const App = () => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" style={{ borderRadius: "50%" }} />
      {/* <h1>Greennit</h1> */}
    </header>
    <main>
      <Reddit />
    </main>
  </div>
)
