import React, { useContext } from "react";
import { AppContext } from "../GlobalStore/Context";

function Toast() {
  const { showToast, toastNotification } = useContext(AppContext);

  return (
    showToast && (
      <div className="grey-indicator-box centerElement">
        {toastNotification}
      </div>
    )
  );
}

export default Toast;
