import React, { useState } from "react";
import { ReactComponent as MenuLogo } from "../Assets/menu-icon.svg";

function Menu({ children }) {
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
        <MenuLogo className="imageStyles" />
        <div className={`dropdownPanel ${open ? "openDropdown" : ""}`}>
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
