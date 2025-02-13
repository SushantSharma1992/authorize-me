import { createContext, useEffect, useState } from "react";
import { obj, SavedData } from "../Utilities/Constants";
import mockData from "..//Assets/mockData.json";

let loadCredentials = JSON.parse(localStorage.getItem(SavedData.credentials));
if (!loadCredentials || loadCredentials?.length === 0) {
  loadCredentials = mockData.myCredentials;
}
export const AppContext = createContext();

const Context = ({ children }) => {
  const [credentials, setCredentials] = useState(loadCredentials);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem(SavedData.credentials, JSON.stringify(credentials));
  }, [credentials]);

  return (
    <AppContext.Provider
      value={{
        showToast,
        setShowToast,
        credentials,
        setCredentials,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default Context;
