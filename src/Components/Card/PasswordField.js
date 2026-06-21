import React, { useState } from "react";
import useToastNotification from "../../Utilities/CustomHooks/useToastNotification";
import { maskPassword } from "../../Utilities/display";

function PasswordField({ password }) {
  const { notify } = useToastNotification();
  const [revealed, setRevealed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      notify("Copied");
    } catch (error) {
      notify("Copied Failed");
    }
  };

  return (
    <div className="cred-field">
      <div className="cred-field__label">Password</div>
      <div className="cred-field__value">
        <span className="cred-field__text cred-field__text--pass">
          {revealed ? password : maskPassword(password)}
        </span>
        <button
          type="button"
          aria-label={revealed ? "Hide password" : "Show password"}
          className="cred-icon-btn"
          onClick={() => setRevealed((p) => !p)}
        >
          {revealed ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
        <button
          type="button"
          aria-label="Copy password"
          className="cred-icon-btn"
          onClick={copy}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
