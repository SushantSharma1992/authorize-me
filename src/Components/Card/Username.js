import React, { useContext } from "react";
import { ReactComponent as CopyImage } from "../../Assets/copy.svg";
import { AppContext } from "../../GlobalStore/Context";

function Username({ label, content }) {
  const { setShowToast } = useContext(AppContext);
  const copyContent = (value) => {
    navigator.clipboard.writeText(value);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };
  return (
    <div className="flex-start flex-column">
      <label className="card_label">{label.toUpperCase()}</label>
      <div
        className="content"
        onClick={() => {
          copyContent(content);
        }}
      >
        {label === "Password" ? (
          <input type="password" readOnly value={content}></input>
        ) : (
          <div className="text_container">{content}</div>
        )}
        <CopyImage className="imageStyles" />
      </div>
    </div>
  );
}

export default Username;
