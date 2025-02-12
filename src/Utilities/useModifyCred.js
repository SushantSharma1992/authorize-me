import React, { useContext } from "react";
import { AppContext } from "../GlobalStore/Context";

const useModifyCred = () => {
  const { credentials, setCredentials } = useContext(AppContext);

  const deleteItem = (item) => {
    const clonedArray = Array.of(...credentials);
    const index = clonedArray.findIndex((o) => o.id === item.id);
    clonedArray.splice(index, 1);
    setCredentials(clonedArray);
  };

  const updateCred = (newItem) => {
    setCredentials((prevState) => {
      const newArray = Array.of(...prevState);
      const index = newArray.findIndex((value) => value.id === newItem.id);
      if (index > 0) {
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
    } else {
      const prevId = credentials[credentials.length - 1]?.id || 0;
      newItem = {
        id: prevId + 1,
        createdOn: new Date(),
        updateOn: new Date(),
        ...data,
      };
      setCredentials((prevState) => [...prevState, newItem]);
    }
  };

  return { deleteItem, editCred };
};

export default useModifyCred;
