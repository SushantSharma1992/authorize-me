import { createContext, useEffect, useState } from "react";
import mockData from "..//Assets/mockData.json";
import { SavedData } from "../Utilities/Constants";

let loadCredentials = JSON.parse(localStorage.getItem(SavedData.credentials));
if (!loadCredentials || loadCredentials?.length === 0) {
  loadCredentials = mockData.myCredentials;
}
export const AppContext = createContext();

const Context = ({ children }) => {
  const [credentials, setCredentials] = useState(loadCredentials);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState("");

  useEffect(() => {
    localStorage.setItem(SavedData.credentials, JSON.stringify(credentials));
  }, [credentials]);

  return (
    <AppContext.Provider
      value={{
        showToast,
        setShowToast,
        toastNotification,
        setToastNotification,
        credentials,
        setCredentials,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default Context;
