import React from "react";

function Tags({ list }) {
  return (
    <div className="flex-start tag-container customize-scrollbar full_width">
      {list.map((tag) => (
        <span key={tag} className="grey-indicator-box tag-margin">{tag}</span>
      ))}
    </div>
  );
}

export default Tags;
