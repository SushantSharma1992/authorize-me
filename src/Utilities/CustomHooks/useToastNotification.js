import React, { useContext } from "react";
import { AppContext } from "../../GlobalStore/Context";

const useToastNotification = () => {
  const { showToast, setShowToast, toastNotification, setToastNotification } =
    useContext(AppContext);

  const notify = (text) => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
    setToastNotification(text);
  };

  return { notify };
};

export default useToastNotification;
