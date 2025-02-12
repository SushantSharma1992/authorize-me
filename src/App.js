import "./App.css";
import Context from "./GlobalStore/Context";
import Home from "./Pages/Home";
import "./Styles/Styles.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Context>
          <Home />
        </Context>
      </header>
    </div>
  );
}

export default App;
