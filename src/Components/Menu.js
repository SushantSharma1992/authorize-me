import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

function Menu({ dropUp, children }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      onBlur={() => {
        setOpen(false);
      }}
      className="menu-component"
      onClick={() => {
        setOpen(!open);
      }}
    >
      <div tabIndex={0} className="dropdownContainer">
        <div className="imageBorder">
          <FiMoreVertical className="imageStyles" />
        </div>
        <div
          className={`dropdownPanel ${
            open ? (dropUp ? "openDropUp" : "openDropdown") : ""
          }`}
        >
          {children}
        </div>
      </div>

      {/* <select ref={selectOptions} name="Menu" id="Menu">
        {options.map((value) => {
          return <option key={value} value={value}>
            {value}
          </option>;
        })}
      </select> */}
    </span>
  );
}

export default Menu;
