import "./App.css";
import VaultGate from "./Components/VaultGate";
import Context from "./GlobalStore/Context";
import "./Styles/Styles.css";

function App() {
  return (
    <div className="App App-header">
      <Context>
        <VaultGate />
      </Context>
    </div>
  );
}

export default App;
