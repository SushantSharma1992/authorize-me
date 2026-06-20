import React, { useContext, useState } from "react";
import { AppContext } from "../GlobalStore/Context";

const LockScreen = () => {
  const { isInitialized, setupPassword, unlock, resetVault } =
    useContext(AppContext);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isInitialized) {
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      await setupPassword(password);
    } else {
      const ok = await unlock(password);
      if (!ok) {
        setError("Incorrect password.");
        setPassword("");
      }
    }
  };

  const onReset = () => {
    if (window.confirm("Erase all saved credentials and start over?")) {
      resetVault();
      setPassword("");
      setConfirm("");
      setError("");
    }
  };

  return (
    <div className="lockscreen-container">
      <form onSubmit={onSubmit} className="lockscreen-form">
        <h2>
          {isInitialized ? "Enter master password" : "Set a master password"}
        </h2>
        <input
          type="password"
          aria-label="Master password"
          placeholder="Master password"
          className="input_class padding-md font-xl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {!isInitialized && (
          <input
            type="password"
            aria-label="Confirm password"
            placeholder="Confirm password"
            className="input_class padding-md font-xl"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        )}
        {error && <div className="lockscreen-error">{error}</div>}
        <button type="submit" className="button_primary full-width font-xl">
          {isInitialized ? "Unlock" : "Create vault"}
        </button>
        {isInitialized && (
          <button
            type="button"
            className="lockscreen-reset"
            onClick={onReset}
          >
            Reset vault (erase all data)
          </button>
        )}
      </form>
    </div>
  );
};

export default LockScreen;
