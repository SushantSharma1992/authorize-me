import React, { useContext } from "react";
import { AppContext } from "../GlobalStore/Context";
import Home from "../Pages/Home";
import LockScreen from "./LockScreen";

const VaultGate = () => {
  const { isLocked } = useContext(AppContext);
  return isLocked ? <LockScreen /> : <Home />;
};

export default VaultGate;
