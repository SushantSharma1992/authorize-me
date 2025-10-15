import React, { useContext } from "react";
import { AppContext } from "../../GlobalStore/Context";
import useToastNotification from "./useToastNotification";

const useModifyCred = () => {
  const { credentials, setCredentials } = useContext(AppContext);
  const { notify } = useToastNotification();
  const deleteItem = (item) => {
    setCredentials(Array.of(...credentials).filter((o) => o.id !== item.id));
    notify(`${item.service} deleted`);
  };

  const updateCred = (newItem) => {
    setCredentials((prevState) => {
      const newArray = Array.of(...prevState);
      const index = newArray.findIndex((value) => value.id === newItem.id);
      if (index !== -1) {
        newArray[index] = newItem;
      }
      return newArray;
    });
  };

  const editCred = (data) => {
    let newItem = {};
    if (data.id) {
      newItem = { ...data, updateOn: new Date() };
      updateCred(newItem);
      notify(`${data.service} updated.`);
    } else {
      const prevId = credentials[credentials.length - 1]?.id || 0;
      newItem = {
        id: prevId + 1,
        createdOn: new Date(),
        updateOn: new Date(),
        ...data,
      };
      setCredentials((prevState) => [...prevState, newItem]);
      notify(`Saved`);
    }
  };

  const loadCredentials = (array) => {
    setCredentials(array);
    notify("Data Loaded.");
  };
  const clearCredentials = () => {
    setCredentials([]);
    notify("Data Cleared");
  };

  return { deleteItem, editCred, clearCredentials, loadCredentials };
};

export default useModifyCred;
