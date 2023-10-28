import "./App.css";
import "./Styles/Styles.css";
import Home from "./Pages/Home";
import { AppContext } from "./GlobalStore/Context";
import { useState } from "react";
import mockData from './Assets/mockData.json'

function App() {
  const [showToast, setShowToast] = useState(false);
  const [credentials, setCredentials] = useState(mockData.myCredentials);
  return (
    <div className="App">
      <header className="App-header">
        <AppContext.Provider
          value={{ showToast, setShowToast, credentials, setCredentials }}
        >
          <Home />
        </AppContext.Provider>
      </header>
    </div>
  );
}

export default App;
