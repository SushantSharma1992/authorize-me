import React, { useState } from "react";
import { ReactComponent as MenuLogo } from "../Assets/menu-icon.svg";

function Menu() {
  const [open, setOpen] = useState(true);
  const options = ["Edit", "Delete"];

  const performOperation = (e) => { 
    console.log(e.target.textContent)
   }

  return (
    <span className="menu-component" onClick={() => {setOpen(!open)}}>
      <div className="dropdownContainer">
        <MenuLogo className="imageStyles" />
        <div className={`dropdownPanel ${open ? "openDropdown" : ""}`}>
          {options.map((item) => {
            return <div key={item} className="dropdownItem" onClick={performOperation}>{item}</div>;
          })}
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
