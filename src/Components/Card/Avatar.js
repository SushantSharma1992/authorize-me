import React from "react";
import { avatarColor, hexToRgba, shade } from "../../Utilities/display";

function Avatar({ name }) {
  const color = avatarColor(name);
  const initial = (String(name || "?")[0] || "?").toUpperCase();
  return (
    <div
      className="cred-avatar"
      style={{
        background: `linear-gradient(145deg, ${color}, ${shade(color, -28)})`,
        color: "#fff",
        boxShadow: `0 4px 12px ${hexToRgba(color, 0.32)}`,
      }}
    >
      {initial}
    </div>
  );
}

export default Avatar;
