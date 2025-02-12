import React from "react";
import Menu from "../Menu";
import MenuItems from "../MenuItem";

export default function CardMenu({ options }) {
  return (
    <Menu>
      <MenuItems options={options} />
    </Menu>
  );
}
