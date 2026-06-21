import React from "react";
import useToastNotification from "../../Utilities/CustomHooks/useToastNotification";

function Username({ label, value }) {
  const { notify } = useToastNotification();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      notify("Copied");
    } catch (error) {
      notify("Copied Failed");
    }
  };

  return (
    <div className="cred-field">
      <div className="cred-field__label">{label}</div>
      <div className="cred-field__value">
        <span className="cred-field__text">{value}</span>
        <button
          type="button"
          aria-label={`Copy ${label.toLowerCase()}`}
          className="cred-icon-btn"
          onClick={copy}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        </button>
      </div>
    </div>
  );
}

export default Username;
