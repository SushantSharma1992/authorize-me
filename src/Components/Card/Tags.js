import React from "react";

function Tags({ list }) {
  return (
    <div className="flex-start tag-container">
      {list.map((tag) => (
        <span key={tag} className="grey-indicator-box tag-margin">{tag}</span>
      ))}
    </div>
  );
}

export default Tags;
