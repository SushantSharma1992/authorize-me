import React from "react";

export default function MenuItems({ options }) {
  return (
    <>
      {options.map((item) => {
        return (
          <div key={item.name} className="dropdownItem font-xl" onClick={item.onClick}>
            {item.name}
          </div>
        );
      })}
    </>
  );
}
