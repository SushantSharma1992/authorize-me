import './App.css';
import './Styles/Styles.css';
import Home from './Pages/Home';
import { AppContext } from './GlobalStore/Context';
import { useState } from 'react';

function App() {
  const [showToast, setShowToast] = useState(false)
  return (
    <div className="App">
      <header className="App-header">
        <AppContext.Provider value={{showToast, setShowToast}}>
        <Home/>
        </AppContext.Provider>
      </header>
    </div>
  );
}

export default App;
