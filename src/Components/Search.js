import React from "react";

function Search() {
  const searchCredentials = (e) => {
    console.log(e.target.value);
  };
  return (
    <div>
      <input className="searchInput" placeholder="Search" onChange={searchCredentials}></input>
    </div>
  );
}

export default Search;
