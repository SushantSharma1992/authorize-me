import React from "react";

function Search({ findQuery }) {
  return (
    <div className="vault-search">
      <span className="vault-search__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      </span>
      <input
        type="search"
        className="vault-search__input"
        placeholder="Search credentials…"
        onChange={findQuery}
      />
    </div>
  );
}

export default Search;
