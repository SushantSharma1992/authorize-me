import React from "react";

function Notes({ content }) {
  if (!content) return null;
  return <div className="cred-note">{content}</div>;
}

export default Notes;
