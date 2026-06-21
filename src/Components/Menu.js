import React, { useState } from "react";

function Menu({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="menu-component"
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Card menu"
        className="cred-kebab"
        onClick={() => setOpen((p) => !p)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>
      </button>
      <div className={`dropdownPanel ${open ? "openDropdown" : ""}`}>
        {children}
      </div>
    </span>
  );
}

export default Menu;
