import React from "react";
import { avatarColor, hexToRgba } from "../../Utilities/display";

function Avatar({ name }) {
  const color = avatarColor(name);
  const initial = (String(name || "?")[0] || "?").toUpperCase();
  return (
    <div
      className="cred-avatar"
      style={{ background: hexToRgba(color, 0.16), color }}
    >
      {initial}
    </div>
  );
}

export default Avatar;
