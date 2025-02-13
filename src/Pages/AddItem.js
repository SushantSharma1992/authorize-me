import React from "react";

const AddItem = ({ handleClick }) => {
  return (
    <div>
      <button
        type="button"
        className="headerItem"
        onClick={() => {
          handleClick();
        }}
      >
        + Add
      </button>
    </div>
  );
};

export default AddItem;
