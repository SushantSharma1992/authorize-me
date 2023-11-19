import React from "react";
import MenuItems from "./MenuItem";
import Menu from "./Menu";

export default function SettingsMenu() {
  const performOperation = (e) => {
    console.log(e.target.textContent);
  };
  const settingOptions = [
      { name: "Import Data", onClick: performOperation },
      { name: "Export Data", onClick: performOperation },
      { name: "Reset Data", onClick: performOperation },
];

  return (
    <Menu>
      <MenuItems options={settingOptions} />
    </Menu>
  );
}
