import React, { useState } from "react";

export default function Notes({content}) {
    const [open, setOpen] = useState(false)
  return (
    <>
      <button className="accordion" onClick={() => { setOpen(!open) }}>Notes</button>
      <div className={`panel ${open?'displayBlock':'displayNone'}`}>
        <p>{content}</p>
      </div>
    </>
  );
}
