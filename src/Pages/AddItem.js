import React from "react";
import AddItemForm from "./AddItemForm";
import Modal from "../Components/Modal";
import { obj } from "../Utilities/Constants";

const AddItem = ({ openForm, handleClick }) => {
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
