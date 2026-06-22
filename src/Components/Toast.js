import React, { useContext } from "react";
import { AppContext } from "../GlobalStore/Context";

function Toast() {
  const { showToast, toastNotification } = useContext(AppContext);
  if (!showToast) return null;
  return <div className="vault-toast">{toastNotification}</div>;
}

export default Toast;
