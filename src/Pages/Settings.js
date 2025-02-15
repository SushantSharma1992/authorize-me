import React, { useState } from "react";
import { FiSettings } from "react-icons/fi";
import Options from "./Options";
import Modal from "../Components/Modal";

const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="margin-auto">
      <div
        className="padding-md flex_horizontal"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <FiSettings />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <div className="list_container">
          <Options />
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
