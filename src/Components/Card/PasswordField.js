import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

const PasswordField = ({ content }) => {
  const PASSWORD = "password";

  const [inputType, setInputType] = useState(PASSWORD);

  const TEXT = "text";
  const toggle = () => {
    setInputType((prev) => (prev === TEXT ? PASSWORD : TEXT));
  };

  return (
    <>
      <div className="flex_horizontal fill-available-width">
        <input
          id="passwordField-id"
          type={inputType}
          readOnly
          disabled
          value={content}
          className="password-container flex-1 fill-available-width font-xl"
        ></input>
      </div>
      <span className="pushLeft" onClick={toggle}>
        {inputType === TEXT ? <FaEyeSlash /> : <FaEye />}
      </span>
    </>
  );
};

export default PasswordField;
