import React from "react";
import { passwordStrength, relativeTime } from "../../Utilities/display";

function StrengthMeter({ password, updated }) {
  const s = passwordStrength(password);
  const when = relativeTime(updated);
  return (
    <div className="cred-foot">
      <div className="cred-strength">
        <div className="cred-strength__track">
          <div
            className="cred-strength__fill"
            style={{ width: s.pct, background: s.color }}
          />
        </div>
        <span className="cred-strength__label" style={{ color: s.color }}>
          {s.label}
        </span>
      </div>
      {when && <span className="cred-updated">{when}</span>}
    </div>
  );
}

export default StrengthMeter;
