import React from "react";

function Search({ findQuery }) {
  return (
    <input
      type="search"
      className="headerItem searchInput"
      placeholder="Search"
      onChange={findQuery}
    ></input>
  );
}

export default Search;
