import React, { useState } from "react";
import Tags from "./Tags";

export default function Notes({ content, tags }) {
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
        <div>
          <p>{content}</p>
        </div>
        {tags && <Tags list={tags} />}
      </div>
    </>
  );
}
