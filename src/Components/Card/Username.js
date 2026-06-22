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
    <div className="cred-row">
      <span className="cred-row__icon" title={label}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </span>
      <span className="cred-row__text">{value}</span>
      <button
        type="button"
        aria-label={`Copy ${(label ?? "").toLowerCase()}`}
        className="cred-icon-btn"
        onClick={copy}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
      </button>
    </div>
  );
}

export default Username;
