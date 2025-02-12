import React, { useState } from "react";

export default function Notes({ content }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      <button className="accordion" onClick={toggle}>
        Notes
      </button>
      <div className={`panel ${open ? "displayBlock" : "displayNone"}`}>
        <p>{content}</p>
      </div>
    </>
  );
}
