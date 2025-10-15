import "./App.css";
import Context from "./GlobalStore/Context";
import Home from "./Pages/Home";
import "./Styles/Styles.css";

function App() {
  return (
    <div className="App App-header">
      <Context>
        <Home />
      </Context>
    </div>
  );
}

export default App;
