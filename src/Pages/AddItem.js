import React from "react";

const AddItem = ({ handleClick }) => (
  <button type="button" className="vault-add" onClick={handleClick}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
    Add
  </button>
);

export default AddItem;
