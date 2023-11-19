import React from "react";
import Menu from "../Menu";
import MenuItems from "../MenuItem";

export default function CardMenu() {
  const performOperation = (e) => {
    console.log(e.target.textContent);
  };
  const options = [
    { name: "Edit", onClick: performOperation },
    { name: "Delete", onClick: performOperation },
  ];
  return (
    <Menu>
      <MenuItems options={options} />
    </Menu>
  );
}
