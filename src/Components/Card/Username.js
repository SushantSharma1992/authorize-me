import React from "react";
import useToastNotification from "../../Utilities/CustomHooks/useToastNotification";
import PasswordField from "./PasswordField";

function Username({ label, content }) {
  const { notify } = useToastNotification();

  const copyContent = (value) => {
    navigator.clipboard.writeText(value);
    notify("Copied !!");
  };
  return (
    <div className="flex-start flex-column flex-1">
      <label className="card_label">{label.toUpperCase()}</label>
      <div
        className="content"
        onClick={() => {
          copyContent(content);
        }}
      >
        {label === "Password" ? (
          <PasswordField content={content} />
        ) : (
          <div className="text_container">{content}</div>
        )}
      </div>
    </div>
  );
}

export default Username;
